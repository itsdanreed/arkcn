import { useEffect, useState } from "react"

/** Mount hidden panels only after first use, and optionally preserve their local state. */
export function usePanelPresence(active: boolean, lazyMount: boolean, unmountOnExit: boolean) {
  const [visited, setVisited] = useState(active)
  useEffect(() => {
    if (active) setVisited(true)
  }, [active])
  return active || (!unmountOnExit && (!lazyMount || visited))
}
