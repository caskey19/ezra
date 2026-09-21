import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { StatusDot } from "../components/ui.tsx"
import { easeOut } from "../motion/tokens.ts"
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion.ts"

export function ComingOnline({ moduleName }: { moduleName: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="flex h-full min-h-[70vh] items-center justify-center">
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/8 bg-white/4 px-10 py-14 text-center"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        {!reduced && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
            <div
              className="h-24 w-full bg-gradient-to-b from-[var(--gold)]/20 to-transparent"
              style={{ animation: "scan 3.2s linear infinite" }}
            />
          </div>
        )}
        <div className="flex items-center justify-center gap-2">
          <StatusDot tone="ok" />
          <p className="text-[11px] tracking-[0.22em] text-[var(--gold)] uppercase">Module offline</p>
        </div>
        <h1 className="mt-5 text-3xl font-medium tracking-tight">{moduleName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Coming online. The command center already blends this tab into today. We will build the
          deep {moduleName.toLowerCase()} workspace next.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-[var(--gold)]/15 px-5 py-2 text-sm text-[var(--gold)] ring-1 ring-[var(--gold)]/30 transition-colors hover:bg-[var(--gold)]/25"
        >
          Return to command
        </Link>
      </motion.div>
    </div>
  )
}

