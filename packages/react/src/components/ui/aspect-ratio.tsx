"use client"

import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"

// Keep the ratio on the rendered element so width, borders, and intrinsic content
// participate in the same layout as the rest of the component's styles.
function AspectRatioRoot({ ratio = 1 / 1, className, style, ...props }: AspectRatioRootProps) {
  return (
    <ark.div
      data-slot="aspect-ratio"
      className={cn("relative aspect-(--ratio)", className)}
      style={{ "--ratio": ratio, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

type AspectRatioRootProps = React.ComponentProps<typeof ark.div> & { ratio?: number }

const AspectRatio = {
  Root: AspectRatioRoot,
}

export { AspectRatio, type AspectRatioRootProps }
