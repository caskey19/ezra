import { useEffect, useMemo, useState } from "react"
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore"
import { useAuth } from "../lib/auth"
import { db } from "../lib/firebase"
import type { MailDoc } from "../lib/types"
import type { MailThread } from "../data/athlete"

function formatMailTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d)
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "Yesterday"
  }
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d)
}

export function mailDocToThread(doc: MailDoc): MailThread {
  return {
    id: doc.id,
    from: doc.from,
    role: doc.role,
    subject: doc.subject,
    preview: doc.preview,
    time: formatMailTime(doc.receivedAt),
    unread: doc.unread,
  }
}

export function useMail(max = 40) {
  const { user, googleLinked } = useAuth()
  const [mail, setMail] = useState<MailDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !googleLinked) {
      setMail([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, "users", user.uid, "mail"),
      orderBy("receivedAtMs", "desc"),
      limit(max),
    )

    return onSnapshot(
      q,
      (snap) => {
        setMail(
          snap.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              threadId: (data.threadId as string) || d.id,
              from: (data.from as string) || "Unknown",
              role: (data.role as string) || "",
              subject: (data.subject as string) || "(no subject)",
              preview: (data.preview as string) || "",
              receivedAt: (data.receivedAt as string) || new Date().toISOString(),
              receivedAtMs: Number(data.receivedAtMs || Date.now()),
              unread: Boolean(data.unread),
              labelIds: (data.labelIds as string[]) || [],
            } satisfies MailDoc
          }),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [user, googleLinked, max])

  const threads = useMemo(() => mail.map(mailDocToThread), [mail])
  const unreadCount = useMemo(() => mail.filter((m) => m.unread).length, [mail])

  return { mail, threads, unreadCount, loading, error, ready: googleLinked }
}
