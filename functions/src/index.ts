import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { onCall, HttpsError } from "firebase-functions/v2/https"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { defineSecret } from "firebase-functions/params"
import { exchangeAndStoreTokens, syncAllLinkedUsers, syncUserGoogleData } from "./sync"

initializeApp()

const googleClientId = defineSecret("GOOGLE_OAUTH_CLIENT_ID")
const googleClientSecret = defineSecret("GOOGLE_OAUTH_CLIENT_SECRET")

const secretOpts = {
  secrets: [googleClientId, googleClientSecret],
  region: "us-central1" as const,
}

export const linkGoogle = onCall(secretOpts, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.")
  }

  const code = request.data?.code
  if (typeof code !== "string" || !code.trim()) {
    throw new HttpsError("invalid-argument", "OAuth authorization code is required.")
  }

  const uid = request.auth.uid
  const user = await getAuth().getUser(uid)

  try {
    const result = await exchangeAndStoreTokens(uid, code.trim(), {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    })
    return { ok: true, ...result }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to link Google"
    throw new HttpsError("failed-precondition", message)
  }
})

export const syncGoogle = onCall(secretOpts, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.")
  }

  try {
    const result = await syncUserGoogleData(request.auth.uid)
    return { ok: true, ...result }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed"
    throw new HttpsError("failed-precondition", message)
  }
})

export const scheduledSyncGoogle = onSchedule(
  {
    ...secretOpts,
    schedule: "every 15 minutes",
    timeZone: "America/New_York",
  },
  async () => {
    await syncAllLinkedUsers()
  },
)
