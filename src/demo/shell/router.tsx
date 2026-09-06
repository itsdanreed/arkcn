import * as React from "react"

/** Minimal hash router for the demo. Real apps bring their own router. */
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#/, "") || "/"
  const [path, setPath] = React.useState(read)
  React.useEffect(() => {
    const onChange = () => setPath(read())
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  const navigate = React.useCallback((to: string) => {
    window.location.hash = to
  }, [])
  return { path, navigate }
}

export function isActive(path: string, url?: string, items?: { url: string }[], mainNav = false) {
  if (!url && !items) return false
  const clean = path.split("?")[0]
  return (
    path === url ||
    clean === url ||
    // Nested pages (e.g. /import/history/imp-1) keep their section active.
    (!!url && url !== "/" && clean.startsWith(url + "/")) ||
    !!items?.some((i) => i.url === path) ||
    (mainNav && !!url && path.split("/")[1] !== "" && path.split("/")[1] === url.split("/")[1])
  )
}
