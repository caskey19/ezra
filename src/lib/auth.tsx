import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { auth, createGoogleProvider, db, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_SCOPES } from "./firebase"
import { linkGoogle, syncGoogle } from "./sync"
import type { UserProfile } from "./types"

type AuthContextValue = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  linking: boolean
  syncing: boolean
  error: string | null
  googleLinked: boolean
  connectGoogle: () => Promise<void>
  refreshSync: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode: "popup"
            select_account?: boolean
            enable_serial_consent?: boolean
            callback: (response: { code?: string; error?: string }) => void
            error_callback?: (error: { message?: string }) => void
          }) => { requestCode: () => void }
        }
      }
    }
  }
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-gis="1"]')
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity")))
      return
    }
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.gis = "1"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Identity"))
    document.head.appendChild(script)
  })
}

function requestOfflineCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        await loadGisScript()
        if (!window.google?.accounts?.oauth2) {
          reject(new Error("Google Identity Services unavailable"))
          return
        }
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_OAUTH_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          ux_mode: "popup",
          select_account: true,
          enable_serial_consent: true,
          callback: (response) => {
            if (response.error || !response.code) {
              reject(new Error(response.error || "No authorization code returned"))
              return
            }
            resolve(response.code)
          },
          error_callback: (error) => reject(new Error(error.message || "Google OAuth failed")),
        })
        client.requestCode()
      } catch (err) {
        reject(err)
      }
    })()
  })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next)
      setLoading(false)
      if (!next) setProfile(null)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = doc(db, "users", user.uid)
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setProfile({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            googleLinked: false,
            lastSyncAt: null,
          })
          return
        }
        const data = snap.data()
        setProfile({
          displayName: (data.displayName as string | null) ?? user.displayName,
          email: (data.email as string | null) ?? user.email,
          photoURL: (data.photoURL as string | null) ?? user.photoURL,
          googleLinked: Boolean(data.googleLinked),
          lastSyncAt: (data.lastSyncAt as string | null) ?? null,
          linkedGoogleAt: data.linkedGoogleAt,
        })
      },
      (err) => setError(err.message),
    )
  }, [user])

  const connectGoogle = useCallback(async () => {
    setError(null)
    setLinking(true)
    try {
      if (!auth.currentUser) {
        await signInWithPopup(auth, createGoogleProvider())
      }
      const code = await requestOfflineCode()
      await linkGoogle(code)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect Google"
      setError(message)
      throw err
    } finally {
      setLinking(false)
    }
  }, [])

  const refreshSync = useCallback(async () => {
    setError(null)
    setSyncing(true)
    try {
      await syncGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed"
      setError(message)
      throw err
    } finally {
      setSyncing(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      linking,
      syncing,
      error,
      googleLinked: Boolean(profile?.googleLinked),
      connectGoogle,
      refreshSync,
      signOut,
      clearError: () => setError(null),
    }),
    [user, profile, loading, linking, syncing, error, connectGoogle, refreshSync, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
