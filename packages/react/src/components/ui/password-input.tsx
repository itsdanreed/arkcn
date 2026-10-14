"use client"

import { usePasswordInput, usePasswordInputContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"
import { PasswordInput as PasswordInputPrimitive } from "@ark-ui/react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function PasswordInputRoot({ className, children, ...props }: PasswordInputRootProps) {
  return (
    <PasswordInputPrimitive.Root
      data-slot="password-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <PasswordInputControl>
              <PasswordInputInput />
              <PasswordInputVisibilityTrigger />
            </PasswordInputControl>
          )}
        </>
      )}
    </PasswordInputPrimitive.Root>
  )
}

function PasswordInputContext({ ...props }: PasswordInputContextProps) {
  return <PasswordInputPrimitive.Context {...props} />
}

function PasswordInputLabel({ className, ...props }: PasswordInputLabelProps) {
  return (
    <PasswordInputPrimitive.Label
      data-slot="password-input-label"
      className={cn("text-sm/none font-medium select-none", className)}
      {...props}
    />
  )
}

function PasswordInputControl({ className, ...props }: PasswordInputControlProps) {
  return (
    <PasswordInputPrimitive.Control
      data-slot="password-input-control"
      className={cn(
        "flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent pr-2 transition-colors not-data-invalid:has-[[data-slot=password-input-input]:focus-visible]:border-ring not-data-invalid:has-[[data-slot=password-input-input]:focus-visible]:ring-3 not-data-invalid:has-[[data-slot=password-input-input]:focus-visible]:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:bg-input/50 data-disabled:opacity-50 dark:data-disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function PasswordInputInput({ className, ...props }: PasswordInputInputProps) {
  return (
    <PasswordInputPrimitive.Input
      data-slot="password-input-input"
      className={cn(
        "h-8 min-w-0 flex-1 bg-transparent py-1 pr-1.5 pl-2.5 text-base outline-none placeholder:text-muted-foreground disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

function PasswordInputVisibilityTrigger({ className, children, ...props }: PasswordInputVisibilityTriggerProps) {
  return (
    <PasswordInputPrimitive.VisibilityTrigger
      data-slot="password-input-visibility-trigger"
      className={cn(
        // Visibility is not an open popup, so it should not use the ghost button
        // aria-expanded surface. Keep the shared button sizing and focus styles.
        buttonVariants({ variant: null, size: "icon-xs" }),
        "mr-[-0.3rem] rounded-[calc(var(--radius)-3px)] text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 [&_svg:not([class*='size-'])]:size-4",
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
            <PasswordInputIndicator fallback={<EyeIcon />}>
              <EyeOffIcon />
            </PasswordInputIndicator>
          )}
        </>
      )}
    </PasswordInputPrimitive.VisibilityTrigger>
  )
}

function PasswordInputIndicator({ ...props }: PasswordInputIndicatorProps) {
  return <PasswordInputPrimitive.Indicator data-slot="password-input-indicator" {...props} />
}

function PasswordInputRootProvider({ className, ...props }: PasswordInputRootProviderProps) {
  return (
    <PasswordInputPrimitive.RootProvider
      data-slot="password-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type PasswordInputRootProps = React.ComponentProps<typeof PasswordInputPrimitive.Root>

type PasswordInputRootProviderProps = React.ComponentProps<typeof PasswordInputPrimitive.RootProvider>

type PasswordInputContextProps = React.ComponentProps<typeof PasswordInputPrimitive.Context>

type PasswordInputControlProps = React.ComponentProps<typeof PasswordInputPrimitive.Control>

type PasswordInputIndicatorProps = React.ComponentProps<typeof PasswordInputPrimitive.Indicator>

type PasswordInputInputProps = Omit<React.ComponentProps<typeof PasswordInputPrimitive.Input>, "id">

type PasswordInputLabelProps = React.ComponentProps<typeof PasswordInputPrimitive.Label>

type PasswordInputVisibilityTriggerProps = React.ComponentProps<typeof PasswordInputPrimitive.VisibilityTrigger>

const PasswordInput = {
  Root: PasswordInputRoot,
  RootProvider: PasswordInputRootProvider,
  Context: PasswordInputContext,
  Control: PasswordInputControl,
  Indicator: PasswordInputIndicator,
  Input: PasswordInputInput,
  Label: PasswordInputLabel,
  VisibilityTrigger: PasswordInputVisibilityTrigger,
}

export {
  usePasswordInput,
  usePasswordInputContext,
  PasswordInput,
  type PasswordInputRootProps,
  type PasswordInputRootProviderProps,
  type PasswordInputContextProps,
  type PasswordInputControlProps,
  type PasswordInputIndicatorProps,
  type PasswordInputInputProps,
  type PasswordInputLabelProps,
  type PasswordInputVisibilityTriggerProps,
}
