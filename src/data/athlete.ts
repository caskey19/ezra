export type Domain = "calendar" | "mail" | "academic" | "athletic" | "recovery"

export type DayBlock = {
  id: string
  start: string
  end: string
  title: string
  location: string
  domain: Domain
}

export type MailThread = {
  id: string
  from: string
  role: string
  subject: string
  preview: string
  time: string
  unread: boolean
}

export type WeekDay = {
  key: string
  label: string
  date: number
  isToday: boolean
  classCount: number
  hasCompetition: boolean
  hasTravel: boolean
}

export type Assignment = {
  course: string
  title: string
  due: string
  hoursLeft: number
}

const DAY_START = 5 * 60
const DAY_SPAN = 18 * 60

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function timeToPct(hhmm: string) {
  const clamped = Math.min(Math.max(toMinutes(hhmm) - DAY_START, 0), DAY_SPAN)
  return (clamped / DAY_SPAN) * 100
}

export const athlete = {
  name: "Jordan Hale",
  firstName: "Jordan",
  initials: "JH",
  year: "Junior",
  division: "NCAA D1",
  school: "Westbrook University",
  program: "Varsity",
  greetingHour: 10,
  now: "10:47",
  dateLabel: "Monday 21 Sep",
  gpa: 3.72,
  gpaDelta: 0.04,
  gpaSeries: [3.41, 3.48, 3.52, 3.55, 3.61, 3.64, 3.68, 3.72],
  credits: 15,
  creditFloor: 12,
  readiness: 78,
  unreadMail: 6,
  eligibility: "Eligible" as const,
  nextCompetition: {
    when: "Sat 14:00",
    title: "Away competition",
    travel: "Depart Thu 12:30",
  },
  weekLoad: [62, 71, 68, 45, 38, 88, 22],
  weekLoadLabels: ["M", "T", "W", "T", "F", "S", "S"],
  assignment: {
    course: "STAT 240",
    title: "Problem Set 4",
    due: "Tue 21:00",
    hoursLeft: 34,
  } satisfies Assignment,
  conflict: {
    severity: "attention" as const,
    title: "Schedule conflict",
    body: "STAT 240 midterm Thursday 14:00 sits inside the team travel window. Departure is 12:30.",
    action: "Request a proctor or earlier sitting",
  },
  today: [
    {
      id: "b1",
      start: "06:30",
      end: "07:10",
      title: "Mobility",
      location: "Performance center",
      domain: "recovery",
    },
    {
      id: "b2",
      start: "07:15",
      end: "07:45",
      title: "Fuel",
      location: "Training table",
      domain: "calendar",
    },
    {
      id: "b3",
      start: "08:00",
      end: "10:15",
      title: "Practice",
      location: "Main field",
      domain: "athletic",
    },
    {
      id: "b4",
      start: "10:30",
      end: "11:45",
      title: "Biomechanics 201",
      location: "Science 214",
      domain: "academic",
    },
    {
      id: "b5",
      start: "12:00",
      end: "13:15",
      title: "Study hall",
      location: "Academic center",
      domain: "academic",
    },
    {
      id: "b6",
      start: "13:30",
      end: "14:45",
      title: "Written Comm 110",
      location: "Arts 018",
      domain: "academic",
    },
    {
      id: "b7",
      start: "15:00",
      end: "16:20",
      title: "Film / walkthrough",
      location: "Team room",
      domain: "athletic",
    },
    {
      id: "b8",
      start: "16:40",
      end: "17:40",
      title: "Strength",
      location: "Weight room",
      domain: "athletic",
    },
    {
      id: "b9",
      start: "19:00",
      end: "19:40",
      title: "Recovery",
      location: "Hydro / treatment",
      domain: "recovery",
    },
    {
      id: "b10",
      start: "20:30",
      end: "22:00",
      title: "STAT 240 work",
      location: "Library L2",
      domain: "academic",
    },
  ] satisfies DayBlock[],
  week: [
    { key: "mon", label: "Mon", date: 21, isToday: true, classCount: 3, hasCompetition: false, hasTravel: false },
    { key: "tue", label: "Tue", date: 22, isToday: false, classCount: 3, hasCompetition: false, hasTravel: false },
    { key: "wed", label: "Wed", date: 23, isToday: false, classCount: 2, hasCompetition: false, hasTravel: false },
    { key: "thu", label: "Thu", date: 24, isToday: false, classCount: 1, hasCompetition: false, hasTravel: true },
    { key: "fri", label: "Fri", date: 25, isToday: false, classCount: 0, hasCompetition: false, hasTravel: true },
    { key: "sat", label: "Sat", date: 26, isToday: false, classCount: 0, hasCompetition: true, hasTravel: true },
    { key: "sun", label: "Sun", date: 27, isToday: false, classCount: 0, hasCompetition: false, hasTravel: false },
  ] satisfies WeekDay[],
  mail: [
    {
      id: "m1",
      from: "Coach Rivera",
      role: "Head coach",
      subject: "Travel roster lock — Thu 09:00",
      preview: "Confirm you are on the bus list. Per diem and hotel rooms freeze at 9.",
      time: "08:12",
      unread: true,
    },
    {
      id: "m2",
      from: "Prof. Okonkwo",
      role: "STAT 240",
      subject: "Midterm seating and conflict form",
      preview: "If you have an athletic conflict, submit the proctor request by Wednesday noon.",
      time: "07:41",
      unread: true,
    },
    {
      id: "m3",
      from: "Compliance",
      role: "Athletics",
      subject: "CARA hours check-in",
      preview: "You are inside countable hours. Log treatment time separately from practice.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: "m4",
      from: "Advisor Kim",
      role: "Academics",
      subject: "Study hall hours this week",
      preview: "Travel week still requires 4 hours. Remote check-in is approved.",
      time: "Yesterday",
      unread: false,
    },
  ] satisfies MailThread[],
}

export const domainColor: Record<Domain, string> = {
  athletic: "var(--gold)",
  academic: "var(--blue)",
  recovery: "var(--ok)",
  calendar: "rgba(255,255,255,0.55)",
  mail: "var(--gold)",
}

export function currentAndNext(blocks: DayBlock[], now: string) {
  const n = toMinutes(now)
  const current = blocks.find((b) => toMinutes(b.start) <= n && n < toMinutes(b.end))
  const upcoming = blocks.filter((b) => toMinutes(b.start) >= (current ? toMinutes(current.end) : n)).slice(0, 3)
  return { current, upcoming }
}
