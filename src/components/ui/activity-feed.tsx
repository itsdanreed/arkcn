import * as React from "react"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/time"
import { cn } from "@/lib/utils"

/**
 * ActivityFeed — a compositional, data-agnostic timeline of events. The
 * consumer maps its events to items; the feed adds the connector line, the
 * marker column, relative times and the WAI-ARIA feed pattern (articles are
 * focusable; PageUp/PageDown move between them, Ctrl+Home/End jump).
 *
 * Anatomy:
 *   ActivityFeed
 *     ActivityFeedGroup > ActivityFeedGroupLabel + ActivityFeedItems
 *       ActivityFeedItem value=…
 *         ActivityFeedItemMarker        dot / icon / avatar on the line
 *         ActivityFeedItemContent
 *           ActivityFeedItemHeader > ActivityFeedItemActor … ActivityFeedItemTime date=…
 *           ActivityFeedItemBody
 *           ActivityFeedItemActions
 *     ActivityFeedLoadMoreTrigger / ActivityFeedEmpty
 */

function ActivityFeed({ className, busy, onKeyDown, ...props }: React.ComponentProps<"div"> & { busy?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      data-slot="activity-feed"
      role="feed"
      aria-busy={busy || undefined}
      className={cn("flex flex-col gap-6", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        const articles = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-slot=activity-feed-item]") ?? [])
        const current = (event.target as HTMLElement).closest<HTMLElement>("[data-slot=activity-feed-item]")
        const index = current ? articles.indexOf(current) : -1
        const meta = event.metaKey || event.ctrlKey
        let next: number | null = null
        if (event.key === "PageDown") next = Math.min(articles.length - 1, index + 1)
        else if (event.key === "PageUp") next = Math.max(0, index - 1)
        else if (event.key === "Home" && meta) next = 0
        else if (event.key === "End" && meta) next = articles.length - 1
        if (next === null || !articles[next]) return
        event.preventDefault()
        articles[next].focus()
      }}
      {...props}
    />
  )
}

function ActivityFeedGroup({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="activity-feed-group" className={cn("flex flex-col gap-3", className)} {...props} />
}

function ActivityFeedGroupLabel({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="activity-feed-group-label"
      className={cn("text-xs font-medium tracking-wide text-muted-foreground uppercase", className)}
      {...props}
    />
  )
}

/** The list; draws the vertical connector behind the markers. */
function ActivityFeedItems({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="activity-feed-items"
      className={cn(
        "relative flex flex-col gap-5 before:absolute before:inset-y-2 before:inset-s-4 before:w-px before:-translate-x-1/2 before:bg-border",
        className
      )}
      {...props}
    />
  )
}

function ActivityFeedItem({ value, className, ...props }: React.ComponentProps<"li"> & { value: string }) {
  return (
    <li
      data-slot="activity-feed-item"
      data-value={value}
      role="article"
      tabIndex={0}
      className={cn(
        "group/activity relative flex gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

/** Sits on the line: pass an icon, an Avatar, or nothing for a dot. */
function ActivityFeedItemMarker({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-item-marker"
      className={cn(
        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-4 ring-background",
        "[&>svg]:size-4 [&>svg]:text-muted-foreground",
        !children && "after:size-2 after:rounded-full after:bg-muted-foreground/60",
        children && "border bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ActivityFeedItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-item-content"
      className={cn("flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5", className)}
      {...props}
    />
  )
}

function ActivityFeedItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-item-header"
      className={cn("flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ActivityFeedItemActor({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="activity-feed-item-actor" className={cn("font-medium text-foreground", className)} {...props} />
  )
}

/** `<time>` with a relative label by default; the full date is in the title. */
function ActivityFeedItemTime({
  date,
  now,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"time">, "dateTime"> & { date: Date; now?: Date }) {
  return (
    <time
      data-slot="activity-feed-item-time"
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
      className={cn("text-xs whitespace-nowrap text-muted-foreground/80", className)}
      {...props}
    >
      {children ?? formatRelativeTime(date, { now })}
    </time>
  )
}

/** Optional detail block: a quote, a diff, a preview card. */
function ActivityFeedItemBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-item-body"
      className={cn("rounded-lg border bg-muted/40 px-3 py-2 text-sm", className)}
      {...props}
    />
  )
}

function ActivityFeedItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-item-actions"
      className={cn("flex items-center gap-1 text-xs", className)}
      {...props}
    />
  )
}

function ActivityFeedLoadMoreTrigger({ asChild, children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="activity-feed-load-more-trigger"
      variant="outline"
      size="sm"
      asChild={asChild}
      className={cn("self-center", className)}
      {...props}
    >
      {asChild ? children : (children ?? "Load older activity")}
    </Button>
  )
}

function ActivityFeedEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-feed-empty"
      className={cn(
        "flex h-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  ActivityFeed,
  ActivityFeedGroup,
  ActivityFeedGroupLabel,
  ActivityFeedItems,
  ActivityFeedItem,
  ActivityFeedItemMarker,
  ActivityFeedItemContent,
  ActivityFeedItemHeader,
  ActivityFeedItemActor,
  ActivityFeedItemTime,
  ActivityFeedItemBody,
  ActivityFeedItemActions,
  ActivityFeedLoadMoreTrigger,
  ActivityFeedEmpty,
}
