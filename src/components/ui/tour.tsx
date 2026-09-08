"use client"

import { useTourContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Tour as TourPrimitive, Portal as PortalPrimitive, useTour } from "@ark-ui/react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function TourRoot({ lazyMount = true, unmountOnExit = true, ...props }: TourRootProps) {
  return <TourPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function TourContext({ ...props }: TourContextProps) {
  return <TourPrimitive.Context {...props} />
}

function TourPortal({ ...props }: TourPortalProps) {
  return <PortalPrimitive {...props} />
}

function TourBackdrop({ className, ...props }: TourBackdropProps) {
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

function TourSpotlight({ className, ...props }: TourSpotlightProps) {
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

function TourPositioner({ className, ...props }: TourPositionerProps) {
  return <TourPrimitive.Positioner data-slot="tour-positioner" className={cn("z-50", className)} {...props} />
}

function TourContent({ className, ...props }: TourContentProps) {
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

function TourArrow({ className, ...props }: TourArrowProps) {
  return (
    <TourPrimitive.Arrow
      data-slot="tour-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <TourPrimitive.ArrowTip data-slot="tour-arrow-tip" className="border-t border-l border-foreground/10" />
        </>
      )}
    </TourPrimitive.Arrow>
  )
}

function TourTitle({ className, ...props }: TourTitleProps) {
  return (
    <TourPrimitive.Title
      data-slot="tour-title"
      className={cn("font-heading text-base font-medium", className)}
      {...props}
    />
  )
}

function TourDescription({ className, ...props }: TourDescriptionProps) {
  return (
    <TourPrimitive.Description
      data-slot="tour-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function TourControl({ className, ...props }: TourControlProps) {
  return (
    <TourPrimitive.Control
      data-slot="tour-control"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function TourProgressText({ className, ...props }: TourProgressTextProps) {
  return (
    <TourPrimitive.ProgressText
      data-slot="tour-progress-text"
      className={cn("text-xs text-muted-foreground tabular-nums", className)}
      {...props}
    />
  )
}

function TourActions({ ...props }: TourActionsProps) {
  return <TourPrimitive.Actions {...props} />
}

function TourActionTrigger({ className, children, ...props }: TourActionTriggerProps) {
  return (
    <TourPrimitive.ActionTrigger data-slot="tour-action-trigger" className={cn(className)} asChild {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="outline" size="sm">
            {children}
          </Button>
        </>
      )}
    </TourPrimitive.ActionTrigger>
  )
}

function TourCloseTrigger({ className, children, ...props }: TourCloseTriggerProps) {
  return (
    <TourPrimitive.CloseTrigger
      data-slot="tour-close-trigger"
      className={cn("absolute top-2 right-2", className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="icon-sm">
            {children ?? <XIcon />}
            <span className="sr-only">Close</span>
          </Button>
        </>
      )}
    </TourPrimitive.CloseTrigger>
  )
}

function TourArrowTip({ className, ...props }: TourArrowTipProps) {
  return <TourPrimitive.ArrowTip data-slot="tour-arrow-tip" className={cn(className)} {...props} />
}

type TourArrowTipProps = React.ComponentProps<typeof TourPrimitive.ArrowTip>

type TourRootProps = React.ComponentProps<typeof TourPrimitive.Root>

type TourActionTriggerProps = React.ComponentProps<typeof TourPrimitive.ActionTrigger>

type TourActionsProps = React.ComponentProps<typeof TourPrimitive.Actions>

type TourArrowProps = React.ComponentProps<typeof TourPrimitive.Arrow>

type TourBackdropProps = React.ComponentProps<typeof TourPrimitive.Backdrop>

type TourCloseTriggerProps = React.ComponentProps<typeof TourPrimitive.CloseTrigger>

type TourContentProps = React.ComponentProps<typeof TourPrimitive.Content>

type TourContextProps = React.ComponentProps<typeof TourPrimitive.Context>

type TourControlProps = React.ComponentProps<typeof TourPrimitive.Control>

type TourDescriptionProps = React.ComponentProps<typeof TourPrimitive.Description>

type TourPortalProps = React.ComponentProps<typeof PortalPrimitive>

type TourPositionerProps = React.ComponentProps<typeof TourPrimitive.Positioner>

type TourProgressTextProps = React.ComponentProps<typeof TourPrimitive.ProgressText>

type TourSpotlightProps = React.ComponentProps<typeof TourPrimitive.Spotlight>

type TourTitleProps = React.ComponentProps<typeof TourPrimitive.Title>

const Tour = {
  ArrowTip: TourArrowTip,
  Root: TourRoot,
  ActionTrigger: TourActionTrigger,
  Actions: TourActions,
  Arrow: TourArrow,
  Backdrop: TourBackdrop,
  CloseTrigger: TourCloseTrigger,
  Content: TourContent,
  Context: TourContext,
  Control: TourControl,
  Description: TourDescription,
  Portal: TourPortal,
  Positioner: TourPositioner,
  ProgressText: TourProgressText,
  Spotlight: TourSpotlight,
  Title: TourTitle,
}

export {
  useTourContext,
  Tour,
  useTour,
  type TourArrowTipProps,
  type TourRootProps,
  type TourActionTriggerProps,
  type TourActionsProps,
  type TourArrowProps,
  type TourBackdropProps,
  type TourCloseTriggerProps,
  type TourContentProps,
  type TourContextProps,
  type TourControlProps,
  type TourDescriptionProps,
  type TourPortalProps,
  type TourPositionerProps,
  type TourProgressTextProps,
  type TourSpotlightProps,
  type TourTitleProps,
}
