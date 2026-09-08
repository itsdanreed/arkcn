"use client"

import { useSwap, useSwapContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Swap as SwapPrimitive } from "@ark-ui/react"

function SwapRoot({ className, ...props }: SwapRootProps) {
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

function SwapIndicator({ className, ...props }: SwapIndicatorProps) {
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

function SwapRootProvider({ className, ...props }: SwapRootProviderProps) {
  return (
    <SwapPrimitive.RootProvider
      data-slot="swap"
      className={cn(
        "relative inline-grid cursor-pointer place-items-center select-none *:col-start-1 *:row-start-1",
        className
      )}
      {...props}
    />
  )
}

type SwapRootProps = React.ComponentProps<typeof SwapPrimitive.Root>

type SwapRootProviderProps = React.ComponentProps<typeof SwapPrimitive.RootProvider>

type SwapIndicatorProps = React.ComponentProps<typeof SwapPrimitive.Indicator>

const Swap = {
  Root: SwapRoot,
  RootProvider: SwapRootProvider,
  Indicator: SwapIndicator,
}

export { useSwap, useSwapContext, Swap, type SwapRootProps, type SwapRootProviderProps, type SwapIndicatorProps }
