import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  currentAndNext,
  domainColor,
  timeToPct,
  type Domain,
} from "../../data/athlete.ts"
import { useAuth } from "../../lib/auth"
import { useEvents } from "../../hooks/useEvents"
import { GlassCard, StatusDot } from "../ui.tsx"
import { GoogleConnectPanel } from "../GoogleConnectPanel.tsx"

const hours = ["05", "08", "11", "14", "17", "20", "23"]

function DomainChip({ domain }: { domain: Domain }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: domainColor[domain], boxShadow: `0 0 8px ${domainColor[domain]}` }}
    />
  )
}

function useLiveNowLabel() {
  const [now, setNow] = useState(() => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`
  })

  useEffect(() => {
    const id = window.setInterval(() => {
      const n = new Date()
      setNow(
        `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`,
      )
    }, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return now
}

export function TodayTimeline() {
  const { googleLinked, loading: authLoading } = useAuth()
  const { todayBlocks, dateLabel, loading, ready } = useEvents()
  const now = useLiveNowLabel()

  if (!authLoading && !googleLinked) {
    return (
      <GoogleConnectPanel
        title="Calendar needs Google"
        body="Connect Google Calendar so Ezra can build today’s field from live events."
      />
    )
  }

  const blocks = ready ? todayBlocks : []
  const { current, upcoming } = currentAndNext(blocks, now)
  const playhead = timeToPct(now)

  return (
    <GlassCard className="flex h-full min-h-[280px] flex-col p-5" delay={0.32} magnetic={false}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">Today field</p>
          <h2 className="mt-1 text-xl font-medium tracking-tight">{dateLabel}</h2>
        </div>
        <div className="text-right">
          <p className="text-[11px] tracking-[0.18em] text-[var(--gold)] uppercase">Now {now}</p>
          <p className="mt-1 text-sm text-[var(--text)]">
            {loading && blocks.length === 0
              ? "Syncing events…"
              : current
                ? current.title
                : upcoming[0]?.title || "No events today"}
            {(current || upcoming[0]) && (
              <span className="text-[var(--muted)]">
                {" "}
                · {current?.location ?? upcoming[0]?.location}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="relative mt-2 flex-1">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden>
          <path
            d="M10 90 C 80 40, 140 140, 220 70 S 360 20, 480 110 S 680 40, 860 95"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="0.6"
          />
          <path
            d="M0 50 C 90 110, 180 20, 300 80 S 520 150, 700 60 S 840 20, 1000 88"
            fill="none"
            stroke="rgba(143,183,255,0.7)"
            strokeWidth="0.5"
          />
        </svg>

        <div className="relative z-[1] mt-6">
          <div className="relative h-16 rounded-xl bg-white/4 ring-1 ring-white/6">
            {blocks.map((block) => {
              const left = timeToPct(block.start)
              const width = Math.max(timeToPct(block.end) - left, 1.6)
              const active = current?.id === block.id
              return (
                <motion.div
                  key={block.id}
                  className="absolute top-2 h-12 origin-left rounded-lg"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: domainColor[block.domain],
                    opacity: active ? 0.95 : 0.55,
                    boxShadow: active ? `0 0 18px ${domainColor[block.domain]}` : "none",
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  title={`${block.title} ${block.start}–${block.end}`}
                />
              )
            })}
            <motion.div
              className="absolute top-0 h-full w-px bg-[var(--text)]"
              style={{ left: `${playhead}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--text)] shadow-[0_0_12px_#fff]" />
            </motion.div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] tracking-widest text-[var(--muted)] uppercase tabular">
            {hours.map((h) => (
              <span key={h}>{h}:00</span>
            ))}
          </div>
        </div>

        <div className="relative z-[1] mt-5 grid grid-cols-3 gap-2">
          {(upcoming.length ? upcoming : blocks.slice(0, 3)).map((block) => (
            <div key={block.id} className="rounded-xl bg-black/20 px-3 py-2.5 ring-1 ring-white/6">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.16em] text-[var(--muted)] uppercase">
                <DomainChip domain={block.domain} />
                {block.start}–{block.end}
              </div>
              <p className="mt-1 truncate text-sm">{block.title}</p>
              <p className="truncate text-[11px] text-[var(--muted)]">{block.location}</p>
            </div>
          ))}
          {!loading && blocks.length === 0 && (
            <p className="col-span-3 text-sm text-[var(--muted)]">No calendar events for today.</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <StatusDot tone="idle" />
          Live blend of class, practice, recovery
        </span>
        <span className="ml-auto inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" /> Athletic
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--blue)]" /> Academic
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" /> Recovery
          </span>
        </span>
      </div>
    </GlassCard>
  )
}
