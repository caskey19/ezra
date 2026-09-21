import { google } from "googleapis"

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly"
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly"

export type Domain = "calendar" | "mail" | "academic" | "athletic" | "recovery"

const athleticKeywords = [
  "practice",
  "training",
  "lift",
  "strength",
  "film",
  "walkthrough",
  "game",
  "match",
  "competition",
  "scrimmage",
  "weight",
  "coach",
  "team",
]

const academicKeywords = [
  "class",
  "lecture",
  "lab",
  "seminar",
  "study",
  "exam",
  "midterm",
  "final",
  "assignment",
  "office hours",
  "tutoring",
  "stat",
  "bio",
  "chem",
  "math",
  "course",
]

const recoveryKeywords = [
  "recovery",
  "treatment",
  "physio",
  "pt ",
  "therapy",
  "mobility",
  "hydro",
  "massage",
  "sleep",
]

export function inferDomain(title: string, location = ""): Domain {
  const hay = `${title} ${location}`.toLowerCase()
  if (recoveryKeywords.some((k) => hay.includes(k))) return "recovery"
  if (athleticKeywords.some((k) => hay.includes(k))) return "athletic"
  if (academicKeywords.some((k) => hay.includes(k))) return "academic"
  return "calendar"
}

export function createOAuthClient(clientId: string, clientSecret: string, redirectUri: string) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function decodeHeader(headers: Array<{ name?: string | null; value?: string | null }> | undefined, name: string) {
  const hit = headers?.find((h) => (h.name || "").toLowerCase() === name.toLowerCase())
  return hit?.value?.trim() || ""
}

export function parseFrom(raw: string): { from: string; role: string } {
  const match = raw.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/)
  if (!match) return { from: raw || "Unknown", role: "" }
  const name = (match[1] || "").trim()
  const email = (match[2] || "").trim()
  if (name) return { from: name, role: email }
  return { from: email || "Unknown", role: "" }
}

export function snippetPreview(snippet?: string | null) {
  return (snippet || "").replace(/\s+/g, " ").trim().slice(0, 180)
}
