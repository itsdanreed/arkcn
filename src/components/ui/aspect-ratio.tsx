"use client"

import { ark } from "@ark-ui/react"
import * as React from "react"

/**
 * Ark UI has no AspectRatio primitive. This mirrors Radix's: a wrapper with a
 * percentage padding-bottom, and an absolutely positioned content box.
 */
function AspectRatioRoot({ ratio = 1 / 1, style, ...props }: AspectRatioRootProps) {
  return (
    <div
      data-slot="aspect-ratio-wrapper"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
      }}
    >
      <ark.div
        data-slot="aspect-ratio"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          ...style,
        }}
        {...props}
      />
    </div>
  )
}

type AspectRatioRootProps = React.ComponentProps<typeof ark.div> & { ratio?: number }

const AspectRatio = {
  Root: AspectRatioRoot,
}

export { AspectRatio, type AspectRatioRootProps }
