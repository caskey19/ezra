import { athlete } from "../../data/athlete.ts"
import { CountUp, GlassCard, ReadinessRing, Sparkline, StatusDot } from "../ui.tsx"

export function MetricPods() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <GlassCard className="px-4 py-3.5" delay={0.22}>
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">GPA</p>
          <span className="text-[11px] text-[var(--ok)] tabular">+{athlete.gpaDelta.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="text-[32px] leading-none font-medium tracking-tight">
            <CountUp value={athlete.gpa} decimals={2} />
          </p>
          <Sparkline data={athlete.gpaSeries} color="var(--ok)" />
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Semester trend</p>
      </GlassCard>

      <GlassCard className="px-4 py-3.5" delay={0.28}>
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Eligibility</p>
          <StatusDot tone="ok" />
        </div>
        <p className="mt-2 text-[32px] leading-none font-medium tracking-tight">
          <CountUp value={athlete.credits} />
          <span className="ml-1 text-base text-[var(--muted)]">/{athlete.creditFloor} cr</span>
        </p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[var(--ok)]"
            style={{ width: `${Math.min(100, (athlete.credits / 18) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Above NCAA floor</p>
      </GlassCard>

      <GlassCard className="px-4 py-3.5" delay={0.34}>
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Readiness</p>
          <ReadinessRing value={athlete.readiness} />
        </div>
        <p className="mt-1 text-[32px] leading-none font-medium tracking-tight">
          <CountUp value={athlete.readiness} />
          <span className="text-base text-[var(--muted)]">%</span>
        </p>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Recovery · available to train</p>
      </GlassCard>

      <GlassCard className="px-4 py-3.5" delay={0.4}>
        <div className="flex items-start justify-between">
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Inbox</p>
          <StatusDot tone="warn" />
        </div>
        <p className="mt-2 text-[32px] leading-none font-medium tracking-tight">
          <CountUp value={athlete.unreadMail} />
        </p>
        <p className="mt-2 text-[11px] text-[var(--muted)]">Unread · coach / faculty / compliance</p>
      </GlassCard>
    </div>
  )
}
