"use client"

import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

function InputOTPRoot({ className, containerClassName, ...props }: InputOTPRootProps) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center has-disabled:opacity-50", containerClassName)}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: InputOTPGroupProps) {
  return (
    <ark.div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <ark.div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex size-8 items-center justify-center border-y border-r border-input text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {char}
          {hasFakeCaret && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
            </div>
          )}
        </>
      )}
    </ark.div>
  )
}

function InputOTPSeparator({ ...props }: InputOTPSeparatorProps) {
  return (
    <ark.div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <MinusIcon />
        </>
      )}
    </ark.div>
  )
}

type InputOTPRootProps = React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}

type InputOTPGroupProps = React.ComponentProps<typeof ark.div>

type InputOTPSlotProps = React.ComponentProps<typeof ark.div> & {
  index: number
}

type InputOTPSeparatorProps = React.ComponentProps<typeof ark.div>

const InputOTP = {
  Root: InputOTPRoot,
  Group: InputOTPGroup,
  Slot: InputOTPSlot,
  Separator: InputOTPSeparator,
}

export {
  InputOTP,
  type InputOTPRootProps,
  type InputOTPGroupProps,
  type InputOTPSlotProps,
  type InputOTPSeparatorProps,
}
