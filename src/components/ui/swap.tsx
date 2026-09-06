"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Swap as SwapPrimitive } from "@ark-ui/react"

function Swap({ className, ...props }: React.ComponentProps<typeof SwapPrimitive.Root>) {
  return (
    <SwapPrimitive.Root
      data-slot="swap"
      className={cn(
        "relative inline-grid cursor-pointer place-items-center select-none *:col-start-1 *:row-start-1",
        className
      )}
      {...props}
    />
  )
}

function SwapIndicator({ className, ...props }: React.ComponentProps<typeof SwapPrimitive.Indicator>) {
  return (
    <SwapPrimitive.Indicator
      data-slot="swap-indicator"
      className={cn(
        "transition-[opacity,transform] duration-200 data-[state=closed]:scale-75 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100",
        className
      )}
      {...props}
    />
  )
}

export { Swap, SwapIndicator }
