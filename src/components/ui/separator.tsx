import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Ark UI has no Separator primitive. This mirrors Radix's: a `div` with
 * `role="separator"` (or `role="none"` when decorative) and `data-orientation`.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  /** Hide the separator from assistive technology. */
  decorative?: boolean
}) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
