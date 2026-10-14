import { ark, Presence } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * FloatingToolbar — the snackbar-style action bar that floats over a page
 * (bulk actions on tables, pending edits on grids). Arrow keys move between
 * its buttons, Home/End jump, and Escape calls `onEscape` unless focus is in a
 * nested menu. Unmounts after the exit animation when `open` is false.
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
    const target = event.target as HTMLElement
    // Portalled menus and editable fields own their navigation keys.
    if (
      !ref.current?.contains(target) ||
      target.isContentEditable ||
      target.closest('input, textarea, select, [role="menu"]')
    )
      return
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
  return (
    <Presence present={open} lazyMount unmountOnExit asChild>
      <ark.div
        ref={ref}
        role="toolbar"
        data-slot="floating-toolbar"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed bottom-6 left-1/2 z-50 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg duration-100 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
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
              className="flex flex-wrap items-center gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
            >
              {children}
            </div>
          </>
        )}
      </ark.div>
    </Presence>
  )
}

type FloatingToolbarRootProps = React.ComponentProps<typeof ark.div> & { open?: boolean; onEscape?: () => void }

const FloatingToolbar = {
  Root: FloatingToolbarRoot,
}

export { FloatingToolbar, type FloatingToolbarRootProps }
