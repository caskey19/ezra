import { athlete } from "../../data/athlete.ts"
import { useAuth } from "../../lib/auth"
import { useEvents } from "../../hooks/useEvents"
import { GlassCard } from "../ui.tsx"

export function WeekStrip() {
  const { googleLinked } = useAuth()
  const { weekDays, weekRangeLabel, ready } = useEvents()

  const days = ready && googleLinked ? weekDays : athlete.week
  const range =
    ready && googleLinked && weekRangeLabel
      ? weekRangeLabel
      : "21–27 Sep"

  return (
    <GlassCard className="flex items-center gap-3 px-4 py-3" delay={0.48}>
      <div className="w-[88px] shrink-0">
        <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Week</p>
        <p className="text-sm">{range}</p>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.key}
            className={`rounded-xl px-2 py-2 text-center ring-1 ${
              day.isToday ? "bg-white/8 ring-[var(--gold)]/50" : "bg-black/20 ring-white/6"
            }`}
          >
            <p className="text-[10px] tracking-[0.16em] text-[var(--muted)] uppercase">{day.label}</p>
            <p className="tabular text-lg leading-tight">{day.date}</p>
            <div className="mt-1 flex justify-center gap-1">
              {day.classCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />}
              {day.hasTravel && <span className="h-1.5 w-1.5 rounded-full bg-[var(--warn)]" />}
              {day.hasCompetition && <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />}
              {day.classCount === 0 && !day.hasTravel && !day.hasCompetition && (
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
