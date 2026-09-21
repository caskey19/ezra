import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { domainColor, type Domain } from "../data/athlete"
import { GoogleConnectPanel } from "../components/GoogleConnectPanel"
import { GlassCard } from "../components/ui"
import { formatHHMM, useEvents } from "../hooks/useEvents"
import { useAuth } from "../lib/auth"
import { easeOut } from "../motion/tokens"
import type { EventDoc } from "../lib/types"

function startOfLocalDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function eventTouchesDay(event: EventDoc, day: Date) {
  const dayStart = startOfLocalDay(day).getTime()
  const dayEnd = new Date(day)
  dayEnd.setHours(23, 59, 59, 999)
  const start = new Date(event.start).getTime()
  const end = event.end ? new Date(event.end).getTime() : start
  if (Number.isNaN(start)) return false
  return start <= dayEnd.getTime() && end >= dayStart
}

function DomainChip({ domain }: { domain: Domain }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: domainColor[domain], boxShadow: `0 0 8px ${domainColor[domain]}` }}
    />
  )
}

function EventRow({ event }: { event: EventDoc }) {
  const timeLabel = event.allDay
    ? "All day"
    : `${formatHHMM(event.start)}${event.end ? `–${formatHHMM(event.end)}` : ""}`

  return (
    <div className="flex items-start gap-3 rounded-xl bg-black/20 px-3 py-3 ring-1 ring-white/6">
      <div className="mt-1.5">
        <DomainChip domain={event.domain} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[10px] tracking-[0.16em] text-[var(--muted)] uppercase">
          <span className="tabular">{timeLabel}</span>
          <span>·</span>
          <span>{event.domain}</span>
        </div>
        <p className="mt-1 truncate text-sm">{event.title}</p>
        <p className="truncate text-[11px] text-[var(--muted)]">{event.location || "—"}</p>
      </div>
      {event.htmlLink && (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noreferrer"
          className="mt-1 text-[var(--muted)] hover:text-[var(--text)]"
          title="Open in Google Calendar"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  )
}

export function CalendarPage() {
  const { googleLinked, loading: authLoading, profile } = useAuth()
  const { events, todayEvents, weekDays, weekRangeLabel, dateLabel, loading, ready } = useEvents()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const selectedDay = useMemo(() => {
    const today = startOfLocalDay()
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)

    const idx = weekDays.findIndex((d) => d.key === selectedKey)
    if (idx >= 0) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + idx)
      return day
    }
    return today
  }, [selectedKey, weekDays])

  const dayEvents = useMemo(
    () => events.filter((e) => eventTouchesDay(e, selectedDay)),
    [events, selectedDay],
  )

  const selectedLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      }).format(selectedDay),
    [selectedDay],
  )

  if (!authLoading && !googleLinked) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-10">
        <GoogleConnectPanel
          title="Calendar module"
          body="Connect Google Calendar so Ezra can sync your week into this workspace."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="flex items-end justify-between px-0.5"
      >
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[var(--muted)] uppercase">Calendar</p>
          <h1 className="mt-1 text-[28px] leading-none font-medium tracking-tight">Week field</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">
          {weekRangeLabel || dateLabel}
          {loading ? " · syncing…" : ready ? ` · ${events.length} events` : null}
        </p>
      </motion.div>

      <GlassCard className="px-4 py-3" delay={0.12} magnetic={false}>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedKey(day.key)}
              className={`rounded-xl px-2 py-3 text-center ring-1 transition-colors ${
                (selectedKey ? selectedKey === day.key : day.isToday)
                  ? "bg-white/8 ring-[var(--gold)]/50"
                  : "bg-black/20 ring-white/6 hover:bg-white/6"
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
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <GlassCard className="flex min-h-[420px] flex-col p-5" delay={0.2} magnetic={false}>
          <div className="mb-4">
            <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Agenda</p>
            <h2 className="mt-1 text-xl font-medium tracking-tight">{selectedLabel}</h2>
          </div>
          <div className="os-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-auto pr-1">
            {dayEvents.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                {loading ? "Loading events…" : "No events on this day."}
              </p>
            ) : (
              dayEvents.map((event) => <EventRow key={event.id} event={event} />)
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex min-h-[280px] flex-col p-5" delay={0.28} magnetic={false}>
          <p className="text-[11px] tracking-[0.18em] text-[var(--muted)] uppercase">Today</p>
          <h3 className="mt-1 text-base font-medium">{dateLabel}</h3>
          <div className="os-scroll mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-auto pr-1">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Nothing scheduled today.</p>
            ) : (
              todayEvents.map((event) => <EventRow key={event.id} event={event} />)
            )}
          </div>
          {profile?.lastSyncAt && (
            <p className="mt-3 text-[11px] text-[var(--muted)]">
              Last sync {new Date(profile.lastSyncAt).toLocaleString()}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
