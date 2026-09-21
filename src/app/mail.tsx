import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { GoogleConnectPanel } from "../components/GoogleConnectPanel"
import { GlassCard, StatusDot } from "../components/ui"
import { useMail, mailDocToThread } from "../hooks/useMail"
import { useAuth } from "../lib/auth"
import { easeOut } from "../motion/tokens"
import type { MailDoc } from "../lib/types"

function formatFullTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d)
}

export function MailPage() {
  const { googleLinked, loading: authLoading, profile } = useAuth()
  const { mail, unreadCount, loading, ready } = useMail(40)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected: MailDoc | null = useMemo(() => {
    if (!mail.length) return null
    const hit = mail.find((m) => m.id === selectedId)
    return hit || mail[0]
  }, [mail, selectedId])

  if (!authLoading && !googleLinked) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-10">
        <GoogleConnectPanel
          title="Mail module"
          body="Connect Gmail so Ezra can sync inbox threads into this workspace."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full min-h-[70vh] max-w-[1440px] flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="flex items-end justify-between px-0.5"
      >
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">Mail</p>
          <h1 className="mt-1 text-[28px] leading-none font-medium tracking-tight">Inbox</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {loading ? "Syncing…" : `${unreadCount} unread`}
          {profile?.lastSyncAt ? ` · synced ${formatFullTime(profile.lastSyncAt)}` : null}
        </p>
      </motion.div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
        <GlassCard className="flex min-h-[420px] flex-col p-3" delay={0.12} magnetic={false}>
          <p className="mb-2 px-2 text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">
            Threads
          </p>
          {!ready || mail.length === 0 ? (
            <p className="px-2 text-sm text-[var(--muted)]">
              {loading ? "Loading messages…" : "No synced messages yet."}
            </p>
          ) : (
            <ul className="os-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-auto pr-1">
              {mail.map((doc) => {
                const thread = mailDocToThread(doc)
                const active = selected?.id === doc.id
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(doc.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ring-1 ${
                        active
                          ? "bg-white/8 ring-[var(--gold)]/40"
                          : "bg-black/20 ring-white/6 hover:bg-white/6"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {thread.unread ? (
                          <StatusDot tone="warn" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white/15" />
                        )}
                        <p className="min-w-0 flex-1 truncate text-sm">{thread.from}</p>
                        <p className="text-[10px] text-[var(--muted)] tabular">{thread.time}</p>
                      </div>
                      <p className="mt-0.5 truncate pl-4 text-[13px]">{thread.subject}</p>
                      <p className="truncate pl-4 text-[11px] text-[var(--muted)]">{thread.preview}</p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="flex min-h-[420px] flex-col p-5" delay={0.2} magnetic={false}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
              Select a thread
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">
                    {selected.unread ? "Unread" : "Read"}
                  </p>
                  <h2 className="mt-1 text-xl font-medium tracking-tight">{selected.subject}</h2>
                  <p className="mt-2 text-sm">
                    {selected.from}
                    {selected.role ? (
                      <span className="text-[var(--muted)]"> · {selected.role}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--muted)] tabular">
                    {formatFullTime(selected.receivedAt)}
                  </p>
                </div>
                <a
                  href={`https://mail.google.com/mail/u/0/#inbox/${selected.threadId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-3 py-1.5 text-xs text-[var(--muted)] ring-1 ring-white/10 transition-colors hover:text-[var(--text)]"
                >
                  Open in Gmail <ExternalLink size={12} />
                </a>
              </div>
              <div className="os-scroll mt-4 min-h-0 flex-1 overflow-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text)]">
                  {selected.preview || "No preview available."}
                </p>
                <p className="mt-6 text-[11px] text-[var(--muted)]">
                  Ezra syncs metadata and snippets only (readonly). Open Gmail for the full body.
                </p>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
