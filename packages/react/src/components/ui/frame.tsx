"use client"
import * as React from "react"
import { Frame as FramePrimitive } from "@ark-ui/react"
import { cn } from "../../lib/utils"

// Keep the document reset below consumer utility layers. An unlayered reset
// overrides Tailwind padding even when the frame receives the correct stylesheet.
const defaultFrameDocument = `<!DOCTYPE html><html><head><style>@layer base { *,*::before,*::after { margin: 0; padding: 0; box-sizing: border-box; } }</style></head><body><div class="frame-root"></div></body></html>`

function FrameRoot({ className, onMount, srcDoc = defaultFrameDocument, ...props }: FrameRootProps) {
  const [mounted, setMounted] = React.useState(false)
  return (
    <FramePrimitive
      data-slot="frame"
      srcDoc={srcDoc}
      className={cn(
        "w-full border-none transition-opacity duration-300 motion-reduce:transition-none",
        mounted ? "opacity-100" : "opacity-0",
        className
      )}
      onMount={() => {
        setMounted(true)
        onMount?.()
      }}
      {...props}
    />
  )
}

type FrameRootProps = React.ComponentProps<typeof FramePrimitive>

const Frame = {
  Root: FrameRoot,
}

export { Frame, type FrameRootProps }
