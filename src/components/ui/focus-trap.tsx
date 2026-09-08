"use client"
import * as React from "react"
import { FocusTrap as FocusTrapPrimitive } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function FocusTrapRoot({ className, ...props }: FocusTrapRootProps) {
  return <FocusTrapPrimitive data-slot="focus-trap" className={cn("", className)} {...props} />
}

type FocusTrapRootProps = React.ComponentProps<typeof FocusTrapPrimitive>

const FocusTrap = {
  Root: FocusTrapRoot,
}

export { FocusTrap, type FocusTrapRootProps }
