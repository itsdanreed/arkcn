import { ark } from "@ark-ui/react"
import { usePopover, usePopoverContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import { Popover as PopoverPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

function PopoverRoot({ positioning, lazyMount = true, unmountOnExit = true, ...props }: PopoverRootProps) {
  return (
    <PopoverPrimitive.Root
      positioning={{ placement: "bottom", gutter: 4, ...positioning }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function PopoverTrigger({ ...props }: PopoverTriggerProps) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverPortal({ ...props }: PopoverPortalProps) {
  return <PortalPrimitive {...props} />
}

function PopoverContext({ ...props }: PopoverContextProps) {
  return <PopoverPrimitive.Context {...props} />
}

function PopoverPositioner({ className, ...props }: PopoverPositionerProps) {
  return (
    <PopoverPrimitive.Positioner
      data-slot="popover-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function PopoverContent({ className, ...props }: PopoverContentProps) {
  return (
    <PopoverPortal>
      <PopoverPositioner>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          className={cn(
            "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </PopoverPositioner>
    </PopoverPortal>
  )
}

function PopoverAnchor({ ...props }: PopoverAnchorProps) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <PopoverPrimitive.ArrowTip data-slot="popover-arrow-tip" className="border-t border-l border-foreground/10" />
        </>
      )}
    </PopoverPrimitive.Arrow>
  )
}

function PopoverCloseTrigger({ ...props }: PopoverCloseTriggerProps) {
  return <PopoverPrimitive.CloseTrigger data-slot="popover-close" {...props} />
}

function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  return <ark.div data-slot="popover-header" className={cn("flex flex-col gap-0.5 text-sm", className)} {...props} />
}

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return <PopoverPrimitive.Title data-slot="popover-title" className={cn("font-medium", className)} {...props} />
}

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Open-state indicator for a trigger; rotates when open. */
function PopoverIndicator({ className, children, ...props }: PopoverIndicatorProps) {
  return (
    <PopoverPrimitive.Indicator
      data-slot="popover-indicator"
      className={cn("inline-flex transition-transform data-[state=open]:rotate-180 [&_svg]:size-4", className)}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <ChevronDownIcon />}</>}
    </PopoverPrimitive.Indicator>
  )
}

function PopoverRootProvider(props: PopoverRootProviderProps) {
  return <PopoverPrimitive.RootProvider {...props} />
}

function PopoverArrowTip({ className, ...props }: PopoverArrowTipProps) {
  return <PopoverPrimitive.ArrowTip data-slot="popover-arrow-tip" className={cn(className)} {...props} />
}

type PopoverArrowTipProps = React.ComponentProps<typeof PopoverPrimitive.ArrowTip>

type PopoverCloseTriggerProps = React.ComponentProps<typeof PopoverPrimitive.CloseTrigger>

type PopoverRootProps = React.ComponentProps<typeof PopoverPrimitive.Root>

type PopoverRootProviderProps = React.ComponentProps<typeof PopoverPrimitive.RootProvider>

type PopoverAnchorProps = React.ComponentProps<typeof PopoverPrimitive.Anchor>

type PopoverArrowProps = React.ComponentProps<typeof PopoverPrimitive.Arrow>

type PopoverContentProps = React.ComponentProps<typeof PopoverPrimitive.Content>

type PopoverContextProps = React.ComponentProps<typeof PopoverPrimitive.Context>

type PopoverDescriptionProps = React.ComponentProps<typeof PopoverPrimitive.Description>

type PopoverHeaderProps = React.ComponentProps<typeof ark.div>

type PopoverPortalProps = React.ComponentProps<typeof PortalPrimitive>

type PopoverPositionerProps = React.ComponentProps<typeof PopoverPrimitive.Positioner>

type PopoverTitleProps = React.ComponentProps<typeof PopoverPrimitive.Title>

type PopoverTriggerProps = React.ComponentProps<typeof PopoverPrimitive.Trigger>

type PopoverIndicatorProps = React.ComponentProps<typeof PopoverPrimitive.Indicator>

const Popover = {
  ArrowTip: PopoverArrowTip,
  CloseTrigger: PopoverCloseTrigger,
  Root: PopoverRoot,
  RootProvider: PopoverRootProvider,
  Anchor: PopoverAnchor,
  Arrow: PopoverArrow,
  Content: PopoverContent,
  Context: PopoverContext,
  Description: PopoverDescription,
  Header: PopoverHeader,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Title: PopoverTitle,
  Trigger: PopoverTrigger,
  Indicator: PopoverIndicator,
}

export {
  usePopover,
  usePopoverContext,
  Popover,
  type PopoverArrowTipProps,
  type PopoverCloseTriggerProps,
  type PopoverRootProps,
  type PopoverRootProviderProps,
  type PopoverAnchorProps,
  type PopoverArrowProps,
  type PopoverContentProps,
  type PopoverContextProps,
  type PopoverDescriptionProps,
  type PopoverHeaderProps,
  type PopoverPortalProps,
  type PopoverPositionerProps,
  type PopoverTitleProps,
  type PopoverTriggerProps,
  type PopoverIndicatorProps,
}
