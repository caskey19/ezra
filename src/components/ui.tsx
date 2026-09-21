import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useState, type ReactNode } from "react"
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion.ts"
import { easeOut } from "../motion/tokens.ts"

type GlassProps = {
  children: ReactNode
  className?: string
  delay?: number
  magnetic?: boolean
}

export function GlassCard({ children, className = "", delay = 0, magnetic = true }: GlassProps) {
  const reduced = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  return (
    <motion.div
      className={`glass sheen rounded-2xl ${className}`}
      style={{ x, y }}
      initial={reduced ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.72, delay, ease: easeOut }}
      onMouseMove={(e) => {
        const node = e.currentTarget
        const r = node.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        node.style.setProperty("--mx", `${px * 100}%`)
        node.style.setProperty("--my", `${py * 100}%`)
        if (magnetic && !reduced) {
          x.set((px - 0.5) * 6)
          y.set((py - 0.5) * 6)
        }
      }}
      onMouseLeave={(e) => {
        x.set(0)
        y.set(0)
        e.currentTarget.style.setProperty("--mx", "50%")
        e.currentTarget.style.setProperty("--my", "0%")
      }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({
  value,
  decimals = 0,
  duration = 1.35,
  className = "",
}: {
  value: number
  decimals?: number
  duration?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  const mv = useMotionValue(reduced ? value : 0)
  const text = useTransform(mv, (v) => v.toFixed(decimals))
  const [display, setDisplay] = useState(reduced ? value.toFixed(decimals) : (0).toFixed(decimals))

  useEffect(() => {
    const unsub = text.on("change", setDisplay)
    if (reduced) {
      mv.set(value)
      setDisplay(value.toFixed(decimals))
    } else {
      const ctrl = animate(mv, value, { duration, ease: easeOut, delay: 0.28 })
      return () => {
        ctrl.stop()
        unsub()
      }
    }
    return unsub
  }, [decimals, duration, mv, reduced, text, value])

  return <span className={`tabular ${className}`}>{display}</span>
}

export function StatusDot({ tone = "ok" }: { tone?: "ok" | "warn" | "crit" | "idle" }) {
  const color =
    tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : tone === "crit" ? "var(--crit)" : "var(--muted)"
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color, animation: "pulse-dot 2.2s ease-in-out infinite" }}
      />
    </span>
  )
}

export function Sparkline({
  data,
  color = "var(--gold)",
  delay = 0.4,
}: {
  data: number[]
  color?: string
  delay?: number
}) {
  const reduced = usePrefersReducedMotion()
  const min = Math.min(...data)
  const max = Math.max(...data)
  const w = 120
  const h = 36
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * (h - 6) - 3
    return `${x},${y}`
  })
  const d = `M ${pts.join(" L ")}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[7.5rem]" aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.35, delay, ease: easeOut }}
      />
    </svg>
  )
}

export function ReadinessRing({ value, delay = 0.35 }: { value: number; delay?: number }) {
  const reduced = usePrefersReducedMotion()
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c * (1 - value / 100)

  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--ok)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 22 22)"
        initial={{ strokeDashoffset: reduced ? offset : c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, delay, ease: easeOut }}
      />
    </svg>
  )
}

export function EzraMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1.2" y="1.2" width="29.6" height="29.6" rx="8" stroke="var(--gold)" strokeWidth="1.2" />
      <path
        d="M10 9.6h12M10 16h8.2M10 22.4h12"
        stroke="var(--text)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
