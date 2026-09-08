"use client"
import * as React from "react"
import { DownloadTrigger as DownloadTriggerPrimitive, useDownload } from "@ark-ui/react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function DownloadTriggerRoot({ className, ...props }: DownloadTriggerRootProps) {
  return (
    <DownloadTriggerPrimitive
      data-slot="download-trigger"
      className={cn(!props.asChild && buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

type DownloadTriggerRootProps = React.ComponentProps<typeof DownloadTriggerPrimitive>

const DownloadTrigger = {
  Root: DownloadTriggerRoot,
}

export { DownloadTrigger, useDownload, type DownloadTriggerRootProps }
