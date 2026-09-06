"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { SignaturePad as SignaturePadPrimitive } from "@ark-ui/react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function SignaturePad({ className, ...props }: React.ComponentProps<typeof SignaturePadPrimitive.Root>) {
  return (
    <SignaturePadPrimitive.Root
      data-slot="signature-pad"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function SignaturePadContext({ ...props }: React.ComponentProps<typeof SignaturePadPrimitive.Context>) {
  return <SignaturePadPrimitive.Context {...props} />
}

function SignaturePadLabel({ className, ...props }: React.ComponentProps<typeof SignaturePadPrimitive.Label>) {
  return (
    <SignaturePadPrimitive.Label
      data-slot="signature-pad-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function SignaturePadControl({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SignaturePadPrimitive.Control>) {
  return (
    <SignaturePadPrimitive.Control
      data-slot="signature-pad-control"
      className={cn(
        "relative h-40 w-full touch-none overflow-hidden rounded-xl border border-input bg-transparent transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <SignaturePadSegment />
          <SignaturePadGuide />
          <SignaturePadClearTrigger />
        </>
      )}
    </SignaturePadPrimitive.Control>
  )
}

function SignaturePadSegment({ className, ...props }: React.ComponentProps<typeof SignaturePadPrimitive.Segment>) {
  return (
    <SignaturePadPrimitive.Segment
      data-slot="signature-pad-segment"
      className={cn("fill-foreground", className)}
      {...props}
    />
  )
}

function SignaturePadGuide({ className, ...props }: React.ComponentProps<typeof SignaturePadPrimitive.Guide>) {
  return (
    <SignaturePadPrimitive.Guide
      data-slot="signature-pad-guide"
      className={cn("pointer-events-none absolute inset-x-4 bottom-8 border-b border-dashed border-border", className)}
      {...props}
    />
  )
}

function SignaturePadClearTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SignaturePadPrimitive.ClearTrigger>) {
  return (
    <SignaturePadPrimitive.ClearTrigger
      data-slot="signature-pad-clear-trigger"
      className={cn("absolute top-2 right-2", className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="icon-sm">
        {children ?? <XIcon />}
        <span className="sr-only">Clear</span>
      </Button>
    </SignaturePadPrimitive.ClearTrigger>
  )
}

function SignaturePadHiddenInput({ ...props }: React.ComponentProps<typeof SignaturePadPrimitive.HiddenInput>) {
  return <SignaturePadPrimitive.HiddenInput {...props} />
}

export {
  SignaturePad,
  SignaturePadClearTrigger,
  SignaturePadContext,
  SignaturePadControl,
  SignaturePadGuide,
  SignaturePadHiddenInput,
  SignaturePadLabel,
  SignaturePadSegment,
}
