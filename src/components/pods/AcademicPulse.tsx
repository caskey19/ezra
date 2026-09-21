import { athlete } from "../../data/athlete.ts"
import { CountUp, GlassCard, Sparkline } from "../ui.tsx"

export function AcademicPulse() {
  const a = athlete.assignment
  return (
    <GlassCard className="flex h-full flex-col p-4" delay={0.58}>
      <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Academic</p>
      <h3 className="mt-1 text-base font-medium">Next deadline</h3>
      <p className="mt-4 text-[11px] tracking-[0.16em] text-[var(--blue)] uppercase">{a.course}</p>
      <p className="text-lg leading-tight">{a.title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">Due {a.due}</p>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-[32px] leading-none font-medium tracking-tight">
            <CountUp value={a.hoursLeft} />
            <span className="ml-1 text-sm text-[var(--muted)]">hrs</span>
          </p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Remaining</p>
        </div>
        <div className="text-right">
          <Sparkline data={athlete.gpaSeries} color="var(--blue)" delay={0.7} />
          <p className="mt-1 text-[11px] text-[var(--muted)]">GPA {athlete.gpa.toFixed(2)}</p>
        </div>
      </div>
    </GlassCard>
  )
}
