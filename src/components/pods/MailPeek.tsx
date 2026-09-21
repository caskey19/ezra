import { athlete } from "../../data/athlete.ts"
import { useAuth } from "../../lib/auth"
import { useMail } from "../../hooks/useMail"
import { GlassCard, StatusDot } from "../ui.tsx"
import { GoogleConnectPanel } from "../GoogleConnectPanel.tsx"

export function MailPeek() {
  const { googleLinked, loading: authLoading } = useAuth()
  const { threads, unreadCount, loading, ready } = useMail(8)

  if (!authLoading && !googleLinked) {
    return (
      <GoogleConnectPanel
        compact
        title="Mail needs Google"
        body="Connect Gmail to populate priority threads in Ezra."
      />
    )
  }

  const list = ready ? threads : []
  const unread = ready ? unreadCount : athlete.unreadMail

  return (
    <GlassCard className="flex h-full flex-col p-4" delay={0.52}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Mail</p>
          <h3 className="text-base font-medium">Priority threads</h3>
        </div>
        <span className="text-[11px] text-[var(--warn)] tabular">
          {loading ? "…" : `${unread} unread`}
        </span>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          {loading ? "Syncing inbox…" : "No messages synced yet. Use Sync now from the header."}
        </p>
      ) : (
        <ul className="os-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-auto pr-1">
          {list.map((thread) => (
            <li
              key={thread.id}
              className="rounded-xl bg-black/25 px-3 py-2 ring-1 ring-white/6 transition-colors hover:bg-white/6"
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
              <p className="mt-0.5 truncate pl-4 text-[13px] text-[var(--text)]">{thread.subject}</p>
              <p className="truncate pl-4 text-[11px] text-[var(--muted)]">{thread.preview}</p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
