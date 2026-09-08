import * as React from "react"
import { Format as FormatPrimitive } from "@ark-ui/react"

/** Locale-aware formatting helpers from Ark, wrapping `Intl`. */

function FormatNumber({ ...props }: FormatNumberProps) {
  return <FormatPrimitive.Number {...props} />
}

function FormatByte({ ...props }: FormatByteProps) {
  return <FormatPrimitive.Byte {...props} />
}

function FormatTime({ ...props }: FormatTimeProps) {
  return <FormatPrimitive.Time {...props} />
}

function FormatRelativeTime({ ...props }: FormatRelativeTimeProps) {
  return <FormatPrimitive.RelativeTime {...props} />
}

type FormatByteProps = React.ComponentProps<typeof FormatPrimitive.Byte>

type FormatNumberProps = React.ComponentProps<typeof FormatPrimitive.Number>

type FormatRelativeTimeProps = React.ComponentProps<typeof FormatPrimitive.RelativeTime>

type FormatTimeProps = React.ComponentProps<typeof FormatPrimitive.Time>

const Format = {
  Byte: FormatByte,
  Number: FormatNumber,
  RelativeTime: FormatRelativeTime,
  Time: FormatTime,
}

export { Format, type FormatByteProps, type FormatNumberProps, type FormatRelativeTimeProps, type FormatTimeProps }
