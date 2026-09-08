"use client"

import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Shared screen-reader announcer. `announce` re-fires even when the same text is
 * announced twice, and `clearAfter` (ms) empties the region so stale text is not
 * re-read when a user lands on it.
 */
function useLiveRegion(options: { clearAfter?: number } = {}) {
  const { clearAfter } = options
  const [message, setMessage] = React.useState("")
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const announce = React.useCallback(
    (text: string) => {
      setMessage("")
      queueMicrotask(() => setMessage(text))
      if (timer.current) clearTimeout(timer.current)
      if (clearAfter) timer.current = setTimeout(() => setMessage(""), clearAfter)
    },
    [clearAfter]
  )
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  return { message, announce }
}

/** Visually hidden `role="status"` region. Pair with `useLiveRegion`. */
function LiveRegionRoot({ message, assertive = false, className, ...props }: LiveRegionRootProps) {
  return (
    <ark.div
      data-slot="live-region"
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn("sr-only", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(props.children) ? props.children : null : <>{message}</>}
    </ark.div>
  )
}

type LiveRegionRootProps = React.ComponentProps<typeof ark.div> & { message: string; assertive?: boolean }

const LiveRegion = {
  Root: LiveRegionRoot,
}

export { LiveRegion, useLiveRegion, type LiveRegionRootProps }
