"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tour as TourPrimitive, Portal as PortalPrimitive, useTour } from "@ark-ui/react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function Tour({ lazyMount = true, unmountOnExit = true, ...props }: React.ComponentProps<typeof TourPrimitive.Root>) {
  return <TourPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function TourContext({ ...props }: React.ComponentProps<typeof TourPrimitive.Context>) {
  return <TourPrimitive.Context {...props} />
}

function TourPortal({ ...props }: React.ComponentProps<typeof PortalPrimitive>) {
  return <PortalPrimitive {...props} />
}

function TourBackdrop({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Backdrop>) {
  return (
    <TourPrimitive.Backdrop
      data-slot="tour-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function TourSpotlight({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Spotlight>) {
  return (
    <TourPrimitive.Spotlight
      data-slot="tour-spotlight"
      className={cn(
        "z-50 rounded-md ring-4 ring-background/60 transition-[left,top,width,height] duration-300",
        className
      )}
      {...props}
    />
  )
}

function TourPositioner({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Positioner>) {
  return <TourPrimitive.Positioner data-slot="tour-positioner" className={cn("z-50", className)} {...props} />
}

function TourContent({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Content>) {
  return (
    <TourPrimitive.Content
      data-slot="tour-content"
      className={cn(
        "z-50 flex w-80 flex-col gap-3 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden data-[type=dialog]:fixed data-[type=dialog]:top-1/2 data-[type=dialog]:left-1/2 data-[type=dialog]:-translate-1/2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function TourArrow({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Arrow>) {
  return (
    <TourPrimitive.Arrow
      data-slot="tour-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      <TourPrimitive.ArrowTip data-slot="tour-arrow-tip" className="border-t border-l border-foreground/10" />
    </TourPrimitive.Arrow>
  )
}

function TourTitle({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Title>) {
  return (
    <TourPrimitive.Title
      data-slot="tour-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function TourDescription({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Description>) {
  return (
    <TourPrimitive.Description
      data-slot="tour-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function TourControl({ className, ...props }: React.ComponentProps<typeof TourPrimitive.Control>) {
  return (
    <TourPrimitive.Control
      data-slot="tour-control"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function TourProgressText({ className, ...props }: React.ComponentProps<typeof TourPrimitive.ProgressText>) {
  return (
    <TourPrimitive.ProgressText
      data-slot="tour-progress-text"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

function TourActions({ ...props }: React.ComponentProps<typeof TourPrimitive.Actions>) {
  return <TourPrimitive.Actions {...props} />
}

function TourActionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TourPrimitive.ActionTrigger>) {
  return (
    <TourPrimitive.ActionTrigger data-slot="tour-action-trigger" className={cn(className)} asChild {...props}>
      <Button variant="outline" size="sm">
        {children}
      </Button>
    </TourPrimitive.ActionTrigger>
  )
}

function TourCloseTrigger({ className, children, ...props }: React.ComponentProps<typeof TourPrimitive.CloseTrigger>) {
  return (
    <TourPrimitive.CloseTrigger
      data-slot="tour-close-trigger"
      className={cn("absolute top-2 right-2", className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="icon-sm">
        {children ?? <XIcon />}
        <span className="sr-only">Close</span>
      </Button>
    </TourPrimitive.CloseTrigger>
  )
}

export {
  Tour,
  TourActionTrigger,
  TourActions,
  TourArrow,
  TourBackdrop,
  TourCloseTrigger,
  TourContent,
  TourContext,
  TourControl,
  TourDescription,
  TourPortal,
  TourPositioner,
  TourProgressText,
  TourSpotlight,
  TourTitle,
  useTour,
}
