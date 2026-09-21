import { athlete } from "../../data/athlete.ts"
import { GlassCard, StatusDot } from "../ui.tsx"

export function ConflictInsight() {
  const c = athlete.conflict
  return (
    <GlassCard className="flex h-full min-h-[280px] flex-col p-5" delay={0.42}>
      <div className="flex items-center gap-2">
        <StatusDot tone="warn" />
        <p className="text-[11px] tracking-[0.18em] text-[var(--warn)] uppercase">Insight</p>
      </div>
      <h3 className="mt-4 text-xl font-medium tracking-tight">{c.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{c.body}</p>
      <div className="mt-6 rounded-xl bg-[var(--warn)]/10 px-3 py-3 ring-1 ring-[var(--warn)]/30">
        <p className="text-[11px] tracking-[0.16em] text-[var(--warn)] uppercase">Recommended</p>
        <p className="mt-1 text-sm">{c.action}</p>
      </div>
      <p className="mt-auto pt-6 text-[11px] text-[var(--muted)]">
        Blended from Calendar + Academic + Athletic
      </p>
    </GlassCard>
  )
}
