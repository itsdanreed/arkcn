import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * FloatingToolbar — the snackbar-style action bar that floats over a page
 * (bulk actions on tables, pending edits on grids). Arrow keys move between
 * its buttons, Home/End jump, and Escape calls `onEscape` unless focus is in a
 * nested menu. Renders nothing while `open` is false.
 */
function FloatingToolbarRoot({
  open = true,
  onEscape,
  className,
  children,
  onKeyDown,
  ...props
}: FloatingToolbarRootProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const list = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [])
    const currentIndex = list.findIndex((b) => b === document.activeElement)
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault()
        list[(currentIndex + 1) % list.length]?.focus()
        break
      case "ArrowLeft":
        event.preventDefault()
        list[currentIndex <= 0 ? list.length - 1 : currentIndex - 1]?.focus()
        break
      case "Home":
        event.preventDefault()
        list[0]?.focus()
        break
      case "End":
        event.preventDefault()
        list[list.length - 1]?.focus()
        break
      case "Escape": {
        const target = event.target as HTMLElement
        const active = document.activeElement as HTMLElement | null
        const inMenu = [target, active].some(
          (el) =>
            el?.closest('[data-slot="dropdown-menu-trigger"]') || el?.closest('[data-slot="dropdown-menu-content"]')
        )
        if (inMenu || !onEscape) return
        event.preventDefault()
        onEscape()
        break
      }
    }
  }
  if (!open) return null
  return (
    <ark.div
      ref={ref}
      role="toolbar"
      data-slot="floating-toolbar"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl transition-all delay-100 duration-300 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div
            data-slot="floating-toolbar-content"
            className="flex items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-xl backdrop-blur-lg supports-backdrop-filter:bg-background/60"
          >
            {children}
          </div>
        </>
      )}
    </ark.div>
  )
}

type FloatingToolbarRootProps = React.ComponentProps<typeof ark.div> & { open?: boolean; onEscape?: () => void }

const FloatingToolbar = {
  Root: FloatingToolbarRoot,
}

export { FloatingToolbar, type FloatingToolbarRootProps }
