import { RefreshCw } from "lucide-react"
import { useAuth } from "../lib/auth"
import { GlassCard, StatusDot } from "./ui"

export function GoogleConnectPanel({
  title = "Connect Google",
  body = "Link Gmail and Calendar so Ezra can sync mail and events into your OS.",
  compact = false,
}: {
  title?: string
  body?: string
  compact?: boolean
}) {
  const { user, connectGoogle, refreshSync, linking, syncing, error, googleLinked, clearError } =
    useAuth()

  if (googleLinked && compact) return null

  return (
    <GlassCard
      className={`flex flex-col items-start gap-3 ${compact ? "p-4" : "p-6"}`}
      delay={0.2}
      magnetic={false}
    >
      <div className="flex items-center gap-2">
        <StatusDot tone={googleLinked ? "ok" : "warn"} />
        <p className="text-[11px] tracking-[0.18em] text-[var(--gold)] uppercase">
          {googleLinked ? "Google linked" : "Google sync"}
        </p>
      </div>
      <div>
        <h3 className="text-base font-medium">{googleLinked ? "Synced with Ezra" : title}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{googleLinked ? "Mail and calendar refresh every 15 minutes, or sync now." : body}</p>
      </div>
      {error && (
        <p className="text-sm text-[var(--warn)]">
          {error}{" "}
          <button type="button" className="underline" onClick={clearError}>
            dismiss
          </button>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {!googleLinked ? (
          <button
            type="button"
            disabled={linking}
            onClick={() => void connectGoogle()}
            className="rounded-full bg-[var(--gold)]/15 px-4 py-2 text-sm text-[var(--gold)] ring-1 ring-[var(--gold)]/30 transition-colors hover:bg-[var(--gold)]/25 disabled:opacity-50"
          >
            {linking ? "Connecting…" : user ? "Grant Gmail & Calendar" : "Connect Google"}
          </button>
        ) : (
          <button
            type="button"
            disabled={syncing}
            onClick={() => void refreshSync()}
            className="inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm ring-1 ring-white/10 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync now"}
          </button>
        )}
      </div>
    </GlassCard>
  )
}
