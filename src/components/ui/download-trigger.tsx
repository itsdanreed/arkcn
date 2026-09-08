"use client"
import * as React from "react"
import { DownloadTrigger as DownloadTriggerPrimitive, useDownload } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function DownloadTriggerRoot({ className, ...props }: DownloadTriggerRootProps) {
  return (
    <DownloadTriggerPrimitive
      data-slot="download-trigger"
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg border border-input px-2.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

type DownloadTriggerRootProps = React.ComponentProps<typeof DownloadTriggerPrimitive>

const DownloadTrigger = {
  Root: DownloadTriggerRoot,
}

export { DownloadTrigger, useDownload, type DownloadTriggerRootProps }
