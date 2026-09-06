import * as React from "react"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

const strip = (pathname: string) => {
  const p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  return (p.replace(/\/+$/, "") || "/").replace(/\/index\.html$/, "") || "/"
}

/** Path router aware of the site base (`/arkcn`). Links use `href` via `Link`. */
export function useRoute() {
  const [path, setPath] = React.useState(() => strip(window.location.pathname))
  React.useEffect(() => {
    const onPop = () => setPath(strip(window.location.pathname))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])
  const navigate = React.useCallback((to: string, options: { replace?: boolean } = {}) => {
    const url = `${BASE}${to}`
    if (options.replace) window.history.replaceState(null, "", url)
    else window.history.pushState(null, "", url)
    setPath(strip(to))
    window.scrollTo({ top: 0 })
  }, [])
  return { path, navigate }
}

export const href = (to: string) => `${BASE}${to}`

const RouterContext = React.createContext<{ path: string; navigate: (to: string) => void } | null>(null)

export function RouterProvider({
  value,
  children,
}: {
  value: { path: string; navigate: (to: string) => void }
  children: React.ReactNode
}) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const ctx = React.useContext(RouterContext)
  if (!ctx) throw new Error("useRouter outside RouterProvider")
  return ctx
}

/** Internal link: full URL for right-click/open-in-new-tab, pushState on plain click. */
export function Link({ to, onClick, ...props }: Omit<React.ComponentProps<"a">, "href"> & { to: string }) {
  const { navigate } = useRouter()
  return (
    <a
      href={href(to)}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
        event.preventDefault()
        navigate(to)
      }}
      {...props}
    />
  )
}
