import { initializeApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"

const firebaseConfig = {
  apiKey: "AIzaSyCEoWbsJRt92Ji9_Al-_zE7wyQHmRwmz-4",
  authDomain: "athlete-os-a0986.firebaseapp.com",
  projectId: "athlete-os-a0986",
  storageBucket: "athlete-os-a0986.firebasestorage.app",
  messagingSenderId: "1012720782379",
  appId: "1:1012720782379:web:50bea02a8698b85810ee6e",
  measurementId: "G-W5FH9PCLD5",
}

/** Public OAuth web client ID (same as Firebase Google provider). Secret stays server-side. */
export const GOOGLE_OAUTH_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID ||
  "1012720782379-placeholder.apps.googleusercontent.com"

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly"
export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly"
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  GMAIL_SCOPE,
  CALENDAR_SCOPE,
].join(" ")

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app, "us-central1")

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider()
  provider.addScope(GMAIL_SCOPE)
  provider.addScope(CALENDAR_SCOPE)
  provider.setCustomParameters({ prompt: "select_account" })
  return provider
}

export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
)
