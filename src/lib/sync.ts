import { httpsCallable } from "firebase/functions"
import { functions } from "./firebase"

export type SyncResult = {
  ok: boolean
  mailCount: number
  eventCount: number
  lastSyncAt: string
}

export async function linkGoogle(code: string) {
  const callable = httpsCallable<{ code: string }, SyncResult>(functions, "linkGoogle")
  const res = await callable({ code })
  return res.data
}

export async function syncGoogle() {
  const callable = httpsCallable<undefined, SyncResult>(functions, "syncGoogle")
  const res = await callable()
  return res.data
}
