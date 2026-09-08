"use client"

import { useSignaturePad, useSignaturePadContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { SignaturePad as SignaturePadPrimitive } from "@ark-ui/react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function SignaturePadRoot({ className, ...props }: SignaturePadRootProps) {
  return (
    <SignaturePadPrimitive.Root
      data-slot="signature-pad"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function SignaturePadContext({ ...props }: SignaturePadContextProps) {
  return <SignaturePadPrimitive.Context {...props} />
}

function SignaturePadLabel({ className, ...props }: SignaturePadLabelProps) {
  return (
    <SignaturePadPrimitive.Label
      data-slot="signature-pad-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function SignaturePadControl({ className, children, ...props }: SignaturePadControlProps) {
  return (
    <SignaturePadPrimitive.Control
      data-slot="signature-pad-control"
      className={cn(
        "relative h-40 w-full touch-none overflow-hidden rounded-xl border border-input bg-transparent transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <>
              <SignaturePadSegment />
              <SignaturePadGuide />
              <SignaturePadClearTrigger />
            </>
          )}
        </>
      )}
    </SignaturePadPrimitive.Control>
  )
}

function SignaturePadSegment({ className, ...props }: SignaturePadSegmentProps) {
  return (
    <SignaturePadPrimitive.Segment
      data-slot="signature-pad-segment"
      className={cn("fill-foreground", className)}
      {...props}
    />
  )
}

function SignaturePadGuide({ className, ...props }: SignaturePadGuideProps) {
  return (
    <SignaturePadPrimitive.Guide
      data-slot="signature-pad-guide"
      className={cn("pointer-events-none absolute inset-x-4 bottom-8 border-b border-dashed border-border", className)}
      {...props}
    />
  )
}

function SignaturePadClearTrigger({ className, children, ...props }: SignaturePadClearTriggerProps) {
  return (
    <SignaturePadPrimitive.ClearTrigger
      data-slot="signature-pad-clear-trigger"
      className={cn("absolute top-2 right-2", className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="icon-sm">
            {children ?? <XIcon />}
            <span className="sr-only">Clear</span>
          </Button>
        </>
      )}
    </SignaturePadPrimitive.ClearTrigger>
  )
}

function SignaturePadHiddenInput({ ...props }: SignaturePadHiddenInputProps) {
  return <SignaturePadPrimitive.HiddenInput {...props} />
}

function SignaturePadRootProvider({ className, ...props }: SignaturePadRootProviderProps) {
  return (
    <SignaturePadPrimitive.RootProvider
      data-slot="signature-pad"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type SignaturePadRootProps = React.ComponentProps<typeof SignaturePadPrimitive.Root>

type SignaturePadRootProviderProps = React.ComponentProps<typeof SignaturePadPrimitive.RootProvider>

type SignaturePadClearTriggerProps = React.ComponentProps<typeof SignaturePadPrimitive.ClearTrigger>

type SignaturePadContextProps = React.ComponentProps<typeof SignaturePadPrimitive.Context>

type SignaturePadControlProps = React.ComponentProps<typeof SignaturePadPrimitive.Control>

type SignaturePadGuideProps = React.ComponentProps<typeof SignaturePadPrimitive.Guide>

type SignaturePadHiddenInputProps = React.ComponentProps<typeof SignaturePadPrimitive.HiddenInput>

type SignaturePadLabelProps = React.ComponentProps<typeof SignaturePadPrimitive.Label>

type SignaturePadSegmentProps = React.ComponentProps<typeof SignaturePadPrimitive.Segment>

const SignaturePad = {
  Root: SignaturePadRoot,
  RootProvider: SignaturePadRootProvider,
  ClearTrigger: SignaturePadClearTrigger,
  Context: SignaturePadContext,
  Control: SignaturePadControl,
  Guide: SignaturePadGuide,
  HiddenInput: SignaturePadHiddenInput,
  Label: SignaturePadLabel,
  Segment: SignaturePadSegment,
}

export {
  useSignaturePad,
  useSignaturePadContext,
  SignaturePad,
  type SignaturePadRootProps,
  type SignaturePadRootProviderProps,
  type SignaturePadClearTriggerProps,
  type SignaturePadContextProps,
  type SignaturePadControlProps,
  type SignaturePadGuideProps,
  type SignaturePadHiddenInputProps,
  type SignaturePadLabelProps,
  type SignaturePadSegmentProps,
}
