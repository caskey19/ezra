import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { google } from "googleapis"
import {
  CALENDAR_SCOPE,
  createOAuthClient,
  decodeHeader,
  GMAIL_SCOPE,
  inferDomain,
  parseFrom,
  snippetPreview,
} from "./google"

const MAIL_LIMIT = 40
const EVENT_WINDOW_DAYS = 7

type SyncResult = {
  mailCount: number
  eventCount: number
  lastSyncAt: string
}

function requireSecrets() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  // GIS popup code client uses redirect_uri=postmessage
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "postmessage"

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET")
  }

  return { clientId, clientSecret, redirectUri }
}

export async function exchangeAndStoreTokens(uid: string, code: string, profile: {
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
}) {
  const { clientId, clientSecret, redirectUri } = requireSecrets()
  const oauth2 = createOAuthClient(clientId, clientSecret, redirectUri)
  const { tokens } = await oauth2.getToken(code)

  if (!tokens.refresh_token && !tokens.access_token) {
    throw new Error("Google did not return tokens. Reconnect with consent prompt.")
  }

  const db = getFirestore()
  const secretRef = db.doc(`users/${uid}/secrets/google`)
  const existing = await secretRef.get()
  const refreshToken = tokens.refresh_token || existing.data()?.refreshToken

  if (!refreshToken) {
    throw new Error("No refresh token available. Disconnect Google and reconnect with consent.")
  }

  await secretRef.set(
    {
      refreshToken,
      accessToken: tokens.access_token || null,
      expiryDate: tokens.expiry_date || null,
      scope: tokens.scope || `${GMAIL_SCOPE} ${CALENDAR_SCOPE}`,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  await db.doc(`users/${uid}`).set(
    {
      displayName: profile.displayName || null,
      email: profile.email || null,
      photoURL: profile.photoURL || null,
      linkedGoogleAt: FieldValue.serverTimestamp(),
      googleLinked: true,
    },
    { merge: true },
  )

  return syncUserGoogleData(uid)
}

async function getAuthedClient(uid: string) {
  const { clientId, clientSecret, redirectUri } = requireSecrets()
  const db = getFirestore()
  const secretSnap = await db.doc(`users/${uid}/secrets/google`).get()
  const refreshToken = secretSnap.data()?.refreshToken as string | undefined

  if (!refreshToken) {
    throw new Error("Google account is not linked.")
  }

  const oauth2 = createOAuthClient(clientId, clientSecret, redirectUri)
  oauth2.setCredentials({ refresh_token: refreshToken })

  oauth2.on("tokens", async (tokens) => {
    const patch: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (tokens.refresh_token) patch.refreshToken = tokens.refresh_token
    if (tokens.access_token) patch.accessToken = tokens.access_token
    if (tokens.expiry_date) patch.expiryDate = tokens.expiry_date
    if (tokens.scope) patch.scope = tokens.scope
    await db.doc(`users/${uid}/secrets/google`).set(patch, { merge: true })
  })

  return oauth2
}

export async function syncUserGoogleData(uid: string): Promise<SyncResult> {
  const oauth2 = await getAuthedClient(uid)
  const db = getFirestore()

  const [mailCount, eventCount] = await Promise.all([
    syncGmail(uid, oauth2),
    syncCalendar(uid, oauth2),
  ])

  const lastSyncAt = new Date().toISOString()
  await db.doc(`users/${uid}`).set(
    {
      lastSyncAt,
      googleLinked: true,
    },
    { merge: true },
  )

  return { mailCount, eventCount, lastSyncAt }
}

async function syncGmail(uid: string, auth: InstanceType<typeof google.auth.OAuth2>) {
  const gmail = google.gmail({ version: "v1", auth })
  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: MAIL_LIMIT,
    q: "in:inbox",
  })

  const messages = list.data.messages || []
  const db = getFirestore()
  const batch = db.batch()
  let written = 0

  for (const item of messages) {
    if (!item.id) continue
    const full = await gmail.users.messages.get({
      userId: "me",
      id: item.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    })

    const headers = full.data.payload?.headers || []
    const fromRaw = decodeHeader(headers, "From")
    const { from, role } = parseFrom(fromRaw)
    const subject = decodeHeader(headers, "Subject") || "(no subject)"
    const labelIds = full.data.labelIds || []
    const unread = labelIds.includes("UNREAD")
    const internalDate = Number(full.data.internalDate || Date.now())

    batch.set(
      db.doc(`users/${uid}/mail/${item.id}`),
      {
        id: item.id,
        threadId: full.data.threadId || item.id,
        from,
        role,
        subject,
        preview: snippetPreview(full.data.snippet),
        receivedAt: new Date(internalDate).toISOString(),
        receivedAtMs: internalDate,
        unread,
        labelIds,
        syncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written += 1
  }

  if (written > 0) await batch.commit()
  return written
}

async function syncCalendar(uid: string, auth: InstanceType<typeof google.auth.OAuth2>) {
  const calendar = google.calendar({ version: "v3", auth })
  const now = new Date()
  const timeMin = new Date(now)
  timeMin.setDate(timeMin.getDate() - EVENT_WINDOW_DAYS)
  timeMin.setHours(0, 0, 0, 0)
  const timeMax = new Date(now)
  timeMax.setDate(timeMax.getDate() + EVENT_WINDOW_DAYS)
  timeMax.setHours(23, 59, 59, 999)

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  })

  const events = res.data.items || []
  const db = getFirestore()
  const batch = db.batch()
  let written = 0

  for (const event of events) {
    if (!event.id) continue
    const allDay = Boolean(event.start?.date && !event.start?.dateTime)
    const startIso = event.start?.dateTime || event.start?.date || null
    const endIso = event.end?.dateTime || event.end?.date || null
    if (!startIso) continue

    const title = event.summary || "(busy)"
    const location = event.location || ""
    const domain = inferDomain(title, location)

    batch.set(
      db.doc(`users/${uid}/events/${event.id}`),
      {
        id: event.id,
        title,
        location,
        start: startIso,
        end: endIso,
        allDay,
        calendarId: "primary",
        htmlLink: event.htmlLink || null,
        domain,
        syncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    written += 1
  }

  if (written > 0) await batch.commit()
  return written
}

export async function syncAllLinkedUsers() {
  const db = getFirestore()
  const linked = await db.collection("users").where("googleLinked", "==", true).get()
  const results: Array<{ uid: string; ok: boolean; error?: string }> = []

  for (const doc of linked.docs) {
    const uid = doc.id
    try {
      await syncUserGoogleData(uid)
      results.push({ uid, ok: true })
    } catch (err) {
      results.push({ uid, ok: false, error: err instanceof Error ? err.message : String(err) })
    }
  }

  return results
}
