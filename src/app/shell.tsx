import { LayoutGroup, motion } from "framer-motion"
import {
  Activity,
  CalendarDays,
  GraduationCap,
  Inbox,
  LayoutGrid,
  LogOut,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { athlete } from "../data/athlete.ts"
import { Atmosphere } from "../components/atmosphere.tsx"
import { EzraMark, StatusDot } from "../components/ui.tsx"
import { useAuth } from "../lib/auth"
import { railStagger } from "../motion/tokens.ts"

const nav = [
  { to: "/", label: "Home", icon: LayoutGrid },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/mail", label: "Mail", icon: Inbox },
  { to: "/academic", label: "Academic", icon: GraduationCap },
  { to: "/athletic", label: "Athletic", icon: Activity },
]

function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  }).format(now)
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now)

  return (
    <div className="text-right">
      <p className="text-[11px] tracking-[0.16em] text-[var(--muted)] uppercase">{date}</p>
      <p className="font-mono text-sm tabular tracking-wide">{time}</p>
    </div>
  )
}

export function Shell() {
  const {
    user,
    profile,
    googleLinked,
    connectGoogle,
    refreshSync,
    signOut,
    linking,
    syncing,
  } = useAuth()

  const displayName = profile?.displayName || user?.displayName || athlete.name
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || athlete.initials

  return (
    <div className="relative h-full min-h-full bg-[var(--bg)] text-[var(--text)]">
      <Atmosphere />
      <div className="grain" />
      <div className="relative z-10 flex h-full">
        <motion.aside
          className="flex w-[76px] flex-col items-center border-r border-white/8 py-5"
          variants={railStagger.container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={railStagger.item} className="mb-8" title="Ezra">
            <EzraMark size={32} />
          </motion.div>
          <LayoutGroup>
            <nav className="flex flex-1 flex-col gap-2">
              {nav.map((item) => {
                const Icon = item.icon
                return (
                  <motion.div key={item.to} variants={railStagger.item}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      title={item.label}
                      aria-label={item.label}
                      className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white/55 transition-colors hover:text-[var(--text)]"
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="nav-indicator"
                              className="absolute inset-0 rounded-xl bg-white/8 ring-1 ring-[var(--gold)]/40"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                          )}
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            className={`relative ${isActive ? "text-[var(--gold)]" : ""}`}
                          />
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                )
              })}
            </nav>
          </LayoutGroup>
          <motion.button
            variants={railStagger.item}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white/45 hover:text-[var(--text)]"
            title="Settings"
          >
            <Settings size={18} strokeWidth={1.5} />
          </motion.button>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-6 border-b border-white/8 px-6">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.22em] text-[var(--gold)] uppercase">Ezra OS</p>
              <p className="truncate text-sm text-[var(--muted)]">Student athlete command</p>
            </div>
            <label className="relative mx-auto hidden w-full max-w-md md:block">
              <Search
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                readOnly
                placeholder="Search the OS"
                className="w-full rounded-full border border-white/8 bg-white/4 py-2 pr-14 pl-9 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
              <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/10 px-1.5 font-mono text-[10px] text-[var(--muted)]">
                ⌘K
              </kbd>
            </label>
            <div className="ml-auto flex items-center gap-3 xl:gap-5">
              <LiveClock />
              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/8">
                <StatusDot tone={googleLinked ? "ok" : "warn"} />
                <span
                  className={`text-[11px] tracking-[0.14em] uppercase ${
                    googleLinked ? "text-[var(--ok)]" : "text-[var(--warn)]"
                  }`}
                >
                  {googleLinked ? "Synced" : "Offline"}
                </span>
              </div>
              {!googleLinked ? (
                <button
                  type="button"
                  disabled={linking}
                  onClick={() => void connectGoogle()}
                  className="hidden rounded-full bg-[var(--gold)]/15 px-3 py-1.5 text-[11px] tracking-[0.14em] text-[var(--gold)] uppercase ring-1 ring-[var(--gold)]/30 transition-colors hover:bg-[var(--gold)]/25 disabled:opacity-50 sm:inline-flex"
                >
                  {linking ? "Connecting…" : "Connect Google"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void refreshSync()}
                  title="Sync Gmail & Calendar"
                  className="hidden h-9 w-9 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/6 hover:text-[var(--text)] disabled:opacity-50 sm:inline-flex"
                >
                  <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                </button>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  title="Sign out"
                  className="hidden h-9 w-9 items-center justify-center rounded-xl text-white/45 transition-colors hover:bg-white/6 hover:text-[var(--text)] sm:inline-flex"
                >
                  <LogOut size={16} />
                </button>
              )}
              <div className="flex items-center gap-2">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-[var(--gold)]/30"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gold)]/15 font-mono text-xs text-[var(--gold)] ring-1 ring-[var(--gold)]/30">
                    {initials}
                  </div>
                )}
                <div className="hidden xl:block">
                  <p className="text-sm leading-tight">{displayName}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {user ? profile?.email || "Google account" : `${athlete.year} · ${athlete.division}`}
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main className="os-scroll min-h-0 flex-1 overflow-auto p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
