import * as React from "react"
import { Format as FormatPrimitive } from "@ark-ui/react"

/** Locale-aware formatting helpers from Ark, wrapping `Intl`. */

function FormatNumber({ ...props }: React.ComponentProps<typeof FormatPrimitive.Number>) {
  return <FormatPrimitive.Number {...props} />
}

function FormatByte({ ...props }: React.ComponentProps<typeof FormatPrimitive.Byte>) {
  return <FormatPrimitive.Byte {...props} />
}

function FormatTime({ ...props }: React.ComponentProps<typeof FormatPrimitive.Time>) {
  return <FormatPrimitive.Time {...props} />
}

function FormatRelativeTime({ ...props }: React.ComponentProps<typeof FormatPrimitive.RelativeTime>) {
  return <FormatPrimitive.RelativeTime {...props} />
}

export { FormatByte, FormatNumber, FormatRelativeTime, FormatTime }
