"use client"

import { useFieldContext, useSignaturePad as useArkSignaturePad, useSignaturePadContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { SignaturePad as SignaturePadPrimitive } from "@ark-ui/react"
import { XIcon } from "lucide-react"

import { Button } from "./button"

function useSignaturePad(props: Parameters<typeof useArkSignaturePad>[0] = {}) {
  const field = useFieldContext()
  const readOnly = props.readOnly ?? field?.readOnly
  const disabled = props.disabled ?? field?.disabled
  // Omitted options must not overwrite Ark's generated ids or inherited Field defaults.
  const definedProps = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
  const api = useArkSignaturePad({ ...definedProps, readOnly, disabled })
  const blocked = !!(readOnly || disabled)
  return {
    ...api,
    clear() {
      if (!blocked) api.clear()
    },
    getClearTriggerProps() {
      const trigger = api.getClearTriggerProps()
      return {
        ...trigger,
        disabled: blocked,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          if (!blocked) trigger.onClick?.(event)
        },
      }
    },
  }
}

function SignaturePadRoot({
  className,
  id,
  ids,
  defaultPaths,
  drawing,
  disabled,
  readOnly,
  name,
  onDraw,
  onDrawEnd,
  paths,
  required,
  translations,
  ...props
}: SignaturePadRootProps) {
  const value = useSignaturePad({
    id,
    ids,
    defaultPaths,
    drawing,
    disabled,
    readOnly,
    name,
    onDraw,
    onDrawEnd,
    paths,
    required,
    translations,
  })
  return (
    <SignaturePadPrimitive.RootProvider
      value={value}
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
      className={cn("flex items-center gap-2 text-sm/none font-medium select-none", className)}
      {...props}
    />
  )
}

function SignaturePadControl({ className, children, ...props }: SignaturePadControlProps) {
  return (
    <SignaturePadPrimitive.Control
      data-slot="signature-pad-control"
      className={cn(
        "relative h-40 w-full touch-none overflow-hidden rounded-lg border border-input bg-transparent transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:bg-input/50 data-disabled:opacity-50 dark:data-disabled:bg-input/80",
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
      className={cn(
        "absolute top-2 right-2 [[data-slot=signature-pad-control][data-disabled]_&]:opacity-100",
        className
      )}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <Button variant="ghost" size="icon-sm">
          {children ?? <XIcon />}
          <span className="sr-only">Clear</span>
        </Button>
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
