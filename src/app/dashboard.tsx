import { motion } from "framer-motion"
import { athlete } from "../data/athlete.ts"
import { AcademicPulse } from "../components/pods/AcademicPulse.tsx"
import { AthleticLoad } from "../components/pods/AthleticLoad.tsx"
import { ConflictInsight } from "../components/pods/ConflictInsight.tsx"
import { MailPeek } from "../components/pods/MailPeek.tsx"
import { MetricPods } from "../components/pods/MetricPods.tsx"
import { TodayTimeline } from "../components/pods/TodayTimeline.tsx"
import { WeekStrip } from "../components/pods/WeekStrip.tsx"
import { useAuth } from "../lib/auth"
import { easeOut } from "../motion/tokens.ts"

export function Dashboard() {
  const { profile, user } = useAuth()
  const firstName =
    (profile?.displayName || user?.displayName || athlete.name).split(" ")[0] || athlete.firstName

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="flex items-end justify-between px-0.5"
      >
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">Command center</p>
          <h1 className="mt-1 text-[28px] leading-none font-medium tracking-tight">
            Good morning, {firstName}
          </h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {athlete.school} · {athlete.program}
        </p>
      </motion.div>

      <MetricPods />

      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,0.85fr)] gap-3">
        <TodayTimeline />
        <ConflictInsight />
      </div>

      <WeekStrip />

      <div className="grid h-[320px] grid-cols-3 gap-3">
        <MailPeek />
        <AcademicPulse />
        <AthleticLoad />
      </div>
    </div>
  )
}
