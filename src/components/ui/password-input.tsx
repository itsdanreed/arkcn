"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PasswordInput as PasswordInputPrimitive } from "@ark-ui/react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

function PasswordInput({ className, children, ...props }: React.ComponentProps<typeof PasswordInputPrimitive.Root>) {
  return (
    <PasswordInputPrimitive.Root
      data-slot="password-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {children ?? (
        <PasswordInputControl>
          <PasswordInputInput />
          <PasswordInputVisibilityTrigger />
        </PasswordInputControl>
      )}
    </PasswordInputPrimitive.Root>
  )
}

function PasswordInputContext({ ...props }: React.ComponentProps<typeof PasswordInputPrimitive.Context>) {
  return <PasswordInputPrimitive.Context {...props} />
}

function PasswordInputLabel({ className, ...props }: React.ComponentProps<typeof PasswordInputPrimitive.Label>) {
  return (
    <PasswordInputPrimitive.Label
      data-slot="password-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function PasswordInputControl({ className, ...props }: React.ComponentProps<typeof PasswordInputPrimitive.Control>) {
  return (
    <PasswordInputPrimitive.Control
      data-slot="password-input-control"
      className={cn(
        "flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent pr-1 transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

/** `id` is omitted: set part ids through the root `ids` prop so Ark's internal lookups keep working. */
function PasswordInputInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PasswordInputPrimitive.Input>, "id">) {
  return (
    <PasswordInputPrimitive.Input
      data-slot="password-input-input"
      className={cn(
        "min-w-0 flex-1 bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm",
        className
      )}
      {...props}
    />
  )
}

function PasswordInputVisibilityTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PasswordInputPrimitive.VisibilityTrigger>) {
  return (
    <PasswordInputPrimitive.VisibilityTrigger
      data-slot="password-input-visibility-trigger"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children ?? (
        <PasswordInputIndicator fallback={<EyeOffIcon />}>
          <EyeIcon />
        </PasswordInputIndicator>
      )}
    </PasswordInputPrimitive.VisibilityTrigger>
  )
}

function PasswordInputIndicator({ ...props }: React.ComponentProps<typeof PasswordInputPrimitive.Indicator>) {
  return <PasswordInputPrimitive.Indicator data-slot="password-input-indicator" {...props} />
}

export {
  PasswordInput,
  PasswordInputContext,
  PasswordInputControl,
  PasswordInputIndicator,
  PasswordInputInput,
  PasswordInputLabel,
  PasswordInputVisibilityTrigger,
}
