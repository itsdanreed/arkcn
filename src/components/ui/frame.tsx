"use client"
import * as React from "react"
import { Frame as FramePrimitive } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function FrameRoot({ className, ...props }: FrameRootProps) {
  return <FramePrimitive data-slot="frame" className={cn("w-full rounded-lg border", className)} {...props} />
}

type FrameRootProps = React.ComponentProps<typeof FramePrimitive>

const Frame = {
  Root: FrameRoot,
}

export { Frame, type FrameRootProps }
