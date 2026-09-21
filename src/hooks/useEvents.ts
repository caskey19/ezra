import { useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { useAuth } from "../lib/auth"
import { db } from "../lib/firebase"
import type { EventDoc } from "../lib/types"
import type { DayBlock, Domain, WeekDay } from "../data/athlete"

function startOfLocalDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfLocalDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export function formatHHMM(iso: string, allDay = false) {
  if (allDay || /^\d{4}-\d{2}-\d{2}$/.test(iso)) return "00:00"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "00:00"
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function eventToDayBlock(event: EventDoc): DayBlock {
  const start = formatHHMM(event.start, event.allDay)
  let end = event.end ? formatHHMM(event.end, event.allDay) : start
  if (event.allDay) {
    end = "23:59"
  }
  return {
    id: event.id,
    start,
    end,
    title: event.title,
    location: event.location || "—",
    domain: event.domain as Domain,
  }
}

function isSameLocalDay(iso: string, day: Date) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number)
    return y === day.getFullYear() && m === day.getMonth() + 1 && d === day.getDate()
  }
  const dt = new Date(iso)
  return (
    dt.getFullYear() === day.getFullYear() &&
    dt.getMonth() === day.getMonth() &&
    dt.getDate() === day.getDate()
  )
}

function eventTouchesDay(event: EventDoc, day: Date) {
  const dayStart = startOfLocalDay(day).getTime()
  const dayEnd = endOfLocalDay(day).getTime()
  const start = new Date(event.start).getTime()
  const end = event.end ? new Date(event.end).getTime() : start
  if (Number.isNaN(start)) return isSameLocalDay(event.start, day)
  return start <= dayEnd && end >= dayStart
}

export function useEvents() {
  const { user, googleLinked } = useAuth()
  const [events, setEvents] = useState<EventDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !googleLinked) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(collection(db, "users", user.uid, "events"), orderBy("start", "asc"))

    return onSnapshot(
      q,
      (snap) => {
        setEvents(
          snap.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              title: (data.title as string) || "(busy)",
              location: (data.location as string) || "",
              start: (data.start as string) || "",
              end: (data.end as string | null) ?? null,
              allDay: Boolean(data.allDay),
              calendarId: (data.calendarId as string) || "primary",
              htmlLink: (data.htmlLink as string | null) ?? null,
              domain: (data.domain as EventDoc["domain"]) || "calendar",
            } satisfies EventDoc
          }),
        )
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [user, googleLinked])

  const today = useMemo(() => startOfLocalDay(new Date()), [])

  const todayEvents = useMemo(
    () => events.filter((e) => eventTouchesDay(e, today)),
    [events, today],
  )

  const todayBlocks = useMemo(() => todayEvents.map(eventToDayBlock), [todayEvents])

  const nowLabel = useMemo(() => {
    const n = new Date()
    return `${pad2(n.getHours())}:${pad2(n.getMinutes())}`
  }, [])

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
      }).format(new Date()),
    [],
  )

  const weekDays = useMemo(() => {
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      const dayEvents = events.filter((e) => eventTouchesDay(e, day))
      const classCount = dayEvents.filter((e) => e.domain === "academic").length
      const hasCompetition = dayEvents.some((e) => {
        const t = e.title.toLowerCase()
        return e.domain === "athletic" && /(game|match|competition|meet)/.test(t)
      })
      const hasTravel = dayEvents.some((e) => /travel|bus|flight|depart/.test(e.title.toLowerCase()))
      return {
        key: keys[i],
        label: labels[i],
        date: day.getDate(),
        isToday: day.getTime() === today.getTime(),
        classCount,
        hasCompetition,
        hasTravel,
      } satisfies WeekDay
    })
  }, [events, today])

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 7) return ""
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d)
    return `${fmt(monday).replace(" ", " ")}–${fmt(sunday)}`.replace(
      /(\d{2}) (\w{3})–(\d{2}) (\w{3})/,
      (_, d1, m1, d2, m2) => (m1 === m2 ? `${d1}–${d2} ${m1}` : `${d1} ${m1}–${d2} ${m2}`),
    )
  }, [today, weekDays])

  return {
    events,
    todayEvents,
    todayBlocks,
    weekDays,
    weekRangeLabel,
    nowLabel,
    dateLabel,
    loading,
    error,
    ready: googleLinked,
  }
}
