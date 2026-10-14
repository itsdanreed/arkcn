import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

export type Framework = "react" | "react-native"
export const frameworkLabels: Record<Framework, string> = { react: "React", "react-native": "React Native" }
export const isFramework = (value: unknown): value is Framework => value === "react" || value === "react-native"
const storageKey = "arkcn-framework"

function readFramework(): Framework {
  const query = new URLSearchParams(window.location.search).get("framework")
  if (isFramework(query)) return query
  try {
    const saved = localStorage.getItem(storageKey)
    if (isFramework(saved)) return saved
  } catch {
    /* Storage may be disabled; the URL still preserves selection. */
  }
  return "react"
}

const FrameworkContext = createContext<{
  framework: Framework
  setFramework: (framework: Framework) => void
} | null>(null)

export function FrameworkProvider({ children }: { children: ReactNode }) {
  const [framework, updateFramework] = useState(readFramework)
  const setFramework = useCallback((next: Framework) => {
    const url = new URL(window.location.href)
    url.searchParams.set("framework", next)
    window.history.replaceState(null, "", url)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      /* URL fallback. */
    }
    updateFramework(next)
  }, [])
  useEffect(() => {
    const sync = () => updateFramework(readFramework())
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])
  return <FrameworkContext.Provider value={{ framework, setFramework }}>{children}</FrameworkContext.Provider>
}

export function useFramework() {
  const context = useContext(FrameworkContext)
  if (!context) throw new Error("useFramework must be inside FrameworkProvider")
  return context
}

export function frameworkQuery(framework: Framework) {
  return `?framework=${framework}`
}
