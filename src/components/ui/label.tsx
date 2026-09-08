import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Ark UI has no standalone Label primitive (its labels live inside each
 * component's anatomy). This mirrors Radix's: a native `label` that ignores
 * double-click text selection.
 */
function LabelRoot({ className, onMouseDown, ...props }: LabelRootProps) {
  return (
    <ark.label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      onMouseDown={(event) => {
        // Only prevent text selection if clicking inside the label itself
        const target = event.target as HTMLElement
        if (target.closest("button, input, select, textarea")) return
        onMouseDown?.(event)
        // Prevent text selection when double clicking label
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault()
      }}
      {...props}
    />
  )
}

type LabelRootProps = React.ComponentProps<typeof ark.label>

const Label = {
  Root: LabelRoot,
}

export { Label, type LabelRootProps }
