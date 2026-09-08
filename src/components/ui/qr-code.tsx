"use client"

import { useQrCode, useQrCodeContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { QrCode as QrCodePrimitive } from "@ark-ui/react"

function QrCodeRoot({ className, children, ...props }: QrCodeRootProps) {
  return (
    <QrCodePrimitive.Root data-slot="qr-code" className={cn("inline-flex", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <QrCodeFrame>
              <QrCodePattern />
            </QrCodeFrame>
          )}
        </>
      )}
    </QrCodePrimitive.Root>
  )
}

function QrCodeContext({ ...props }: QrCodeContextProps) {
  return <QrCodePrimitive.Context {...props} />
}

function QrCodeFrame({ className, ...props }: QrCodeFrameProps) {
  return (
    <QrCodePrimitive.Frame
      data-slot="qr-code-frame"
      className={cn("size-40 rounded-lg border bg-background fill-foreground p-2", className)}
      {...props}
    />
  )
}

function QrCodePattern({ ...props }: QrCodePatternProps) {
  return <QrCodePrimitive.Pattern data-slot="qr-code-pattern" {...props} />
}

function QrCodeOverlay({ className, ...props }: QrCodeOverlayProps) {
  return (
    <QrCodePrimitive.Overlay
      data-slot="qr-code-overlay"
      className={cn("flex items-center justify-center rounded-md bg-background p-1", className)}
      {...props}
    />
  )
}

function QrCodeDownloadTrigger({ ...props }: QrCodeDownloadTriggerProps) {
  return <QrCodePrimitive.DownloadTrigger data-slot="qr-code-download-trigger" {...props} />
}

function QrCodeRootProvider({ className, ...props }: QrCodeRootProviderProps) {
  return <QrCodePrimitive.RootProvider data-slot="qr-code" className={cn("inline-flex", className)} {...props} />
}

type QrCodeRootProps = React.ComponentProps<typeof QrCodePrimitive.Root>

type QrCodeRootProviderProps = React.ComponentProps<typeof QrCodePrimitive.RootProvider>

type QrCodeContextProps = React.ComponentProps<typeof QrCodePrimitive.Context>

type QrCodeDownloadTriggerProps = React.ComponentProps<typeof QrCodePrimitive.DownloadTrigger>

type QrCodeFrameProps = React.ComponentProps<typeof QrCodePrimitive.Frame>

type QrCodeOverlayProps = React.ComponentProps<typeof QrCodePrimitive.Overlay>

type QrCodePatternProps = React.ComponentProps<typeof QrCodePrimitive.Pattern>

const QrCode = {
  Root: QrCodeRoot,
  RootProvider: QrCodeRootProvider,
  Context: QrCodeContext,
  DownloadTrigger: QrCodeDownloadTrigger,
  Frame: QrCodeFrame,
  Overlay: QrCodeOverlay,
  Pattern: QrCodePattern,
}

export {
  useQrCode,
  useQrCodeContext,
  QrCode,
  type QrCodeRootProps,
  type QrCodeRootProviderProps,
  type QrCodeContextProps,
  type QrCodeDownloadTriggerProps,
  type QrCodeFrameProps,
  type QrCodeOverlayProps,
  type QrCodePatternProps,
}
