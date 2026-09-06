"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { QrCode as QrCodePrimitive } from "@ark-ui/react"

function QrCode({ className, children, ...props }: React.ComponentProps<typeof QrCodePrimitive.Root>) {
  return (
    <QrCodePrimitive.Root data-slot="qr-code" className={cn("inline-flex", className)} {...props}>
      {children ?? (
        <QrCodeFrame>
          <QrCodePattern />
        </QrCodeFrame>
      )}
    </QrCodePrimitive.Root>
  )
}

function QrCodeContext({ ...props }: React.ComponentProps<typeof QrCodePrimitive.Context>) {
  return <QrCodePrimitive.Context {...props} />
}

function QrCodeFrame({ className, ...props }: React.ComponentProps<typeof QrCodePrimitive.Frame>) {
  return (
    <QrCodePrimitive.Frame
      data-slot="qr-code-frame"
      className={cn("size-40 rounded-lg border bg-background fill-foreground p-2", className)}
      {...props}
    />
  )
}

function QrCodePattern({ ...props }: React.ComponentProps<typeof QrCodePrimitive.Pattern>) {
  return <QrCodePrimitive.Pattern data-slot="qr-code-pattern" {...props} />
}

function QrCodeOverlay({ className, ...props }: React.ComponentProps<typeof QrCodePrimitive.Overlay>) {
  return (
    <QrCodePrimitive.Overlay
      data-slot="qr-code-overlay"
      className={cn("flex items-center justify-center rounded-md bg-background p-1", className)}
      {...props}
    />
  )
}

function QrCodeDownloadTrigger({ ...props }: React.ComponentProps<typeof QrCodePrimitive.DownloadTrigger>) {
  return <QrCodePrimitive.DownloadTrigger data-slot="qr-code-download-trigger" {...props} />
}

export { QrCode, QrCodeContext, QrCodeDownloadTrigger, QrCodeFrame, QrCodeOverlay, QrCodePattern }
