import * as React from "react"
import { cn } from "@/lib/utils"
import { HoverCard as HoverCardPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

function HoverCard({
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return (
    <HoverCardPrimitive.Root
      positioning={{ placement: "bottom", gutter: 4, ...positioning }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function HoverCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardPortal({ ...props }: React.ComponentProps<typeof PortalPrimitive>) {
  return <PortalPrimitive {...props} />
}

function HoverCardContext({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Context>) {
  return <HoverCardPrimitive.Context {...props} />
}

function HoverCardPositioner({ className, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Positioner>) {
  return (
    <HoverCardPrimitive.Positioner
      data-slot="hover-card-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function HoverCardArrow({ className, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Arrow>) {
  return (
    <HoverCardPrimitive.Arrow
      data-slot="hover-card-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      <HoverCardPrimitive.ArrowTip
        data-slot="hover-card-arrow-tip"
        className="border-t border-l border-foreground/10"
      />
    </HoverCardPrimitive.Arrow>
  )
}

function HoverCardContent({ className, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
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

export {
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardContext,
  HoverCardPortal,
  HoverCardPositioner,
  HoverCardTrigger,
}
