import { motion } from "framer-motion"
import { athlete } from "../../data/athlete.ts"
import { CountUp, GlassCard } from "../ui.tsx"
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion.ts"

export function AthleticLoad() {
  const reduced = usePrefersReducedMotion()
  const max = Math.max(...athlete.weekLoad)

  return (
    <GlassCard className="flex h-full flex-col p-4" delay={0.64}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Athletic</p>
          <h3 className="mt-1 text-base font-medium">Weekly load</h3>
        </div>
        <p className="text-[11px] text-[var(--gold)]">
          {athlete.nextCompetition.when} · {athlete.nextCompetition.title}
        </p>
      </div>
      <div className="mt-5 flex h-[92px] items-end gap-2">
        {athlete.weekLoad.map((v, i) => (
          <div key={`${athlete.weekLoadLabels[i]}-${i}`} className="flex flex-1 flex-col items-center gap-1.5">
            <motion.div
              className="w-full rounded-t-md bg-[var(--gold)]"
              style={{ boxShadow: "0 0 16px rgba(212,196,168,0.25)" }}
              initial={{ height: reduced ? `${(v / max) * 76}px` : 4 }}
              animate={{ height: `${(v / max) * 76}px` }}
              transition={{ duration: 0.85, delay: 0.55 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="text-[10px] text-[var(--muted)]">{athlete.weekLoadLabels[i]}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between pt-3">
        <p className="text-[11px] text-[var(--muted)]">{athlete.nextCompetition.travel}</p>
        <p className="text-sm">
          Peak <CountUp value={max} />
        </p>
      </div>
    </GlassCard>
  )
}
