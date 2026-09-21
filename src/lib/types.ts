export type MailDoc = {
  id: string
  threadId: string
  from: string
  role: string
  subject: string
  preview: string
  receivedAt: string
  receivedAtMs: number
  unread: boolean
  labelIds: string[]
}

export type EventDoc = {
  id: string
  title: string
  location: string
  start: string
  end: string | null
  allDay: boolean
  calendarId: string
  htmlLink: string | null
  domain: "calendar" | "mail" | "academic" | "athletic" | "recovery"
}

export type UserProfile = {
  displayName: string | null
  email: string | null
  photoURL: string | null
  googleLinked: boolean
  lastSyncAt: string | null
  linkedGoogleAt?: unknown
}
