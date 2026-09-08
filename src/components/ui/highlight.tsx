"use client"
import * as React from "react"
import { Highlight as HighlightPrimitive, useHighlight } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function HighlightRoot({ className, ...props }: HighlightRootProps) {
  return (
    <HighlightPrimitive
      data-slot="highlight"
      className={cn("rounded-sm bg-primary/15 text-foreground", className)}
      {...props}
    />
  )
}

type HighlightRootProps = React.ComponentProps<typeof HighlightPrimitive>

const Highlight = {
  Root: HighlightRoot,
}

export { Highlight, useHighlight, type HighlightRootProps }
