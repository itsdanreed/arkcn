import { useHoverCard, useHoverCardContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { HoverCard as HoverCardPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

function HoverCardRoot({ positioning, lazyMount = true, unmountOnExit = true, ...props }: HoverCardRootProps) {
  return (
    <HoverCardPrimitive.Root
      positioning={{ placement: "bottom", gutter: 4, ...positioning }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function HoverCardTrigger({ ...props }: HoverCardTriggerProps) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardPortal({ ...props }: HoverCardPortalProps) {
  return <PortalPrimitive {...props} />
}

function HoverCardContext({ ...props }: HoverCardContextProps) {
  return <HoverCardPrimitive.Context {...props} />
}

function HoverCardPositioner({ className, ...props }: HoverCardPositionerProps) {
  return (
    <HoverCardPrimitive.Positioner
      data-slot="hover-card-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function HoverCardArrow({ className, ...props }: HoverCardArrowProps) {
  return (
    <HoverCardPrimitive.Arrow
      data-slot="hover-card-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <HoverCardPrimitive.ArrowTip
            data-slot="hover-card-arrow-tip"
            className="border-t border-l border-foreground/10"
          />
        </>
      )}
    </HoverCardPrimitive.Arrow>
  )
}

function HoverCardContent({ className, ...props }: HoverCardContentProps) {
  return (
    <HoverCardPortal>
      <HoverCardPositioner>
        <HoverCardPrimitive.Content
          data-slot="hover-card-content"
          className={cn(
            "z-50 w-64 origin-(--transform-origin) rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </HoverCardPositioner>
    </HoverCardPortal>
  )
}

function HoverCardRootProvider(props: HoverCardRootProviderProps) {
  return <HoverCardPrimitive.RootProvider {...props} />
}

function HoverCardArrowTip({ className, ...props }: HoverCardArrowTipProps) {
  return <HoverCardPrimitive.ArrowTip data-slot="hover-card-arrow-tip" className={cn(className)} {...props} />
}

type HoverCardArrowTipProps = React.ComponentProps<typeof HoverCardPrimitive.ArrowTip>

type HoverCardRootProps = React.ComponentProps<typeof HoverCardPrimitive.Root>

type HoverCardRootProviderProps = React.ComponentProps<typeof HoverCardPrimitive.RootProvider>

type HoverCardArrowProps = React.ComponentProps<typeof HoverCardPrimitive.Arrow>

type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content>

type HoverCardContextProps = React.ComponentProps<typeof HoverCardPrimitive.Context>

type HoverCardPortalProps = React.ComponentProps<typeof PortalPrimitive>

type HoverCardPositionerProps = React.ComponentProps<typeof HoverCardPrimitive.Positioner>

type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger>

const HoverCard = {
  ArrowTip: HoverCardArrowTip,
  Root: HoverCardRoot,
  RootProvider: HoverCardRootProvider,
  Arrow: HoverCardArrow,
  Content: HoverCardContent,
  Context: HoverCardContext,
  Portal: HoverCardPortal,
  Positioner: HoverCardPositioner,
  Trigger: HoverCardTrigger,
}

export {
  useHoverCard,
  useHoverCardContext,
  HoverCard,
  type HoverCardArrowTipProps,
  type HoverCardRootProps,
  type HoverCardRootProviderProps,
  type HoverCardArrowProps,
  type HoverCardContentProps,
  type HoverCardContextProps,
  type HoverCardPortalProps,
  type HoverCardPositionerProps,
  type HoverCardTriggerProps,
}
