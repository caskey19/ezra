import { useEffect, useState } from "react"

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  return reduced
}

export function useDocumentHidden() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const apply = () => setHidden(document.hidden)
    apply()
    document.addEventListener("visibilitychange", apply)
    return () => document.removeEventListener("visibilitychange", apply)
  }, [])

  return hidden
}
