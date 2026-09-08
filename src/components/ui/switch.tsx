"use client"

import { useSwitch, useSwitchContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "@ark-ui/react"

function SwitchRoot({ className, ...props }: SwitchRootProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size="default"
      className={cn("group/switch peer inline-flex items-center gap-2", className)}
      {...props}
    />
  )
}

function SwitchContext({ ...props }: SwitchContextProps) {
  return <SwitchPrimitive.Context {...props} />
}

function SwitchControl({ className, ...props }: SwitchControlProps) {
  return (
    <SwitchPrimitive.Control
      data-slot="switch-control"
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-focus-visible/field-label:border-transparent group-has-focus-visible/field-label:ring-0 group-data-[size=default]/switch:h-[18.4px] group-data-[size=default]/switch:w-8 group-data-[size=sm]/switch:h-3.5 group-data-[size=sm]/switch:w-6 after:absolute after:-inset-x-3 after:-inset-y-2 data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  return (
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground",
        className
      )}
      {...props}
    />
  )
}

function SwitchLabel({ className, ...props }: SwitchLabelProps) {
  return (
    <SwitchPrimitive.Label
      data-slot="switch-label"
      className={cn("text-sm leading-none select-none data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function SwitchHiddenInput({ ...props }: SwitchHiddenInputProps) {
  return <SwitchPrimitive.HiddenInput {...props} />
}

function SwitchRootProvider({ className, ...props }: SwitchRootProviderProps) {
  return (
    <SwitchPrimitive.RootProvider
      data-slot="switch"
      data-size="default"
      className={cn("group/switch peer inline-flex items-center gap-2", className)}
      {...props}
    />
  )
}

type SwitchRootProps = React.ComponentProps<typeof SwitchPrimitive.Root>

type SwitchRootProviderProps = React.ComponentProps<typeof SwitchPrimitive.RootProvider>

type SwitchContextProps = React.ComponentProps<typeof SwitchPrimitive.Context>

type SwitchControlProps = React.ComponentProps<typeof SwitchPrimitive.Control>

type SwitchHiddenInputProps = React.ComponentProps<typeof SwitchPrimitive.HiddenInput>

type SwitchLabelProps = React.ComponentProps<typeof SwitchPrimitive.Label>

type SwitchThumbProps = React.ComponentProps<typeof SwitchPrimitive.Thumb>

const Switch = {
  Root: SwitchRoot,
  RootProvider: SwitchRootProvider,
  Context: SwitchContext,
  Control: SwitchControl,
  HiddenInput: SwitchHiddenInput,
  Label: SwitchLabel,
  Thumb: SwitchThumb,
}

export {
  useSwitch,
  useSwitchContext,
  Switch,
  type SwitchRootProps,
  type SwitchRootProviderProps,
  type SwitchContextProps,
  type SwitchControlProps,
  type SwitchHiddenInputProps,
  type SwitchLabelProps,
  type SwitchThumbProps,
}
