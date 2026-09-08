"use client"
import * as React from "react"
import { PinInput as PinInputPrimitive, usePinInput, usePinInputContext } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function PinInputContext(props: PinInputContextProps) {
  return <PinInputPrimitive.Context {...props} />
}

function PinInputControl({ className, ...props }: PinInputControlProps) {
  return <PinInputPrimitive.Control data-slot="pin-input-control" className={cn("flex gap-2", className)} {...props} />
}

function PinInputHiddenInput({ className, ...props }: PinInputHiddenInputProps) {
  return <PinInputPrimitive.HiddenInput data-slot="pin-input-hidden-input" className={cn(className)} {...props} />
}

function PinInputInput({ className, ...props }: PinInputInputProps) {
  return (
    <PinInputPrimitive.Input
      data-slot="pin-input-input"
      className={cn(
        "size-9 h-8 min-w-0 rounded-lg border border-input bg-transparent px-0 text-center text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function PinInputLabel({ className, ...props }: PinInputLabelProps) {
  return (
    <PinInputPrimitive.Label
      data-slot="pin-input-label"
      className={cn("text-sm font-medium data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function PinInputRoot({ className, ...props }: PinInputRootProps) {
  return <PinInputPrimitive.Root data-slot="pin-input" className={cn("flex flex-col gap-1.5", className)} {...props} />
}

function PinInputRootProvider({ className, ...props }: PinInputRootProviderProps) {
  return (
    <PinInputPrimitive.RootProvider
      data-slot="pin-input-root-provider"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type PinInputRootProps = React.ComponentProps<typeof PinInputPrimitive.Root>

type PinInputContextProps = React.ComponentProps<typeof PinInputPrimitive.Context>

type PinInputControlProps = React.ComponentProps<typeof PinInputPrimitive.Control>

type PinInputHiddenInputProps = React.ComponentProps<typeof PinInputPrimitive.HiddenInput>

type PinInputInputProps = React.ComponentProps<typeof PinInputPrimitive.Input>

type PinInputLabelProps = React.ComponentProps<typeof PinInputPrimitive.Label>

type PinInputRootProviderProps = React.ComponentProps<typeof PinInputPrimitive.RootProvider>

const PinInput = {
  Root: PinInputRoot,
  Context: PinInputContext,
  Control: PinInputControl,
  HiddenInput: PinInputHiddenInput,
  Input: PinInputInput,
  Label: PinInputLabel,
  RootProvider: PinInputRootProvider,
}

export {
  PinInput,
  usePinInput,
  usePinInputContext,
  type PinInputRootProps,
  type PinInputContextProps,
  type PinInputControlProps,
  type PinInputHiddenInputProps,
  type PinInputInputProps,
  type PinInputLabelProps,
  type PinInputRootProviderProps,
}
