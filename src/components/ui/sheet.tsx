import { ark } from "@ark-ui/react"
import { useDialog, useDialogContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as SheetPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function SheetRoot({ lazyMount = true, unmountOnExit = true, ...props }: SheetRootProps) {
  return <SheetPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function SheetTrigger({ ...props }: SheetTriggerProps) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetCloseTrigger({ ...props }: SheetCloseTriggerProps) {
  return <SheetPrimitive.CloseTrigger data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPortalProps) {
  return <PortalPrimitive {...props} />
}

function SheetContext({ ...props }: SheetContextProps) {
  return <SheetPrimitive.Context {...props} />
}

function SheetBackdrop({ className, ...props }: SheetBackdropProps) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetPositioner({ className, ...props }: SheetPositionerProps) {
  return (
    <SheetPrimitive.Positioner
      data-slot="sheet-positioner"
      className={cn("fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <SheetPositioner data-side={side}>
        <SheetPrimitive.Content
          data-slot="sheet-content"
          data-side={side}
          className={cn(
            "absolute flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <SheetPrimitive.CloseTrigger data-slot="sheet-close" asChild>
              <Button variant="ghost" className="absolute top-3 right-3" size="icon-sm">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.CloseTrigger>
          )}
        </SheetPrimitive.Content>
      </SheetPositioner>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return <ark.div data-slot="sheet-header" className={cn("flex flex-col gap-0.5 p-4", className)} {...props} />
}

function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <ark.div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
}

function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-heading text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SheetRootProvider(props: SheetRootProviderProps) {
  return <SheetPrimitive.RootProvider {...props} />
}

type SheetBackdropProps = React.ComponentProps<typeof SheetPrimitive.Backdrop>

type SheetCloseTriggerProps = React.ComponentProps<typeof SheetPrimitive.CloseTrigger>

type SheetRootProps = React.ComponentProps<typeof SheetPrimitive.Root>

type SheetRootProviderProps = React.ComponentProps<typeof SheetPrimitive.RootProvider>

type SheetTriggerProps = React.ComponentProps<typeof SheetPrimitive.Trigger>

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}

type SheetContextProps = React.ComponentProps<typeof SheetPrimitive.Context>

type SheetHeaderProps = React.ComponentProps<typeof ark.div>

type SheetFooterProps = React.ComponentProps<typeof ark.div>

type SheetPortalProps = React.ComponentProps<typeof PortalPrimitive>

type SheetPositionerProps = React.ComponentProps<typeof SheetPrimitive.Positioner>

type SheetTitleProps = React.ComponentProps<typeof SheetPrimitive.Title>

type SheetDescriptionProps = React.ComponentProps<typeof SheetPrimitive.Description>

const Sheet = {
  Backdrop: SheetBackdrop,
  CloseTrigger: SheetCloseTrigger,
  Root: SheetRoot,
  RootProvider: SheetRootProvider,
  Trigger: SheetTrigger,
  Content: SheetContent,
  Context: SheetContext,
  Header: SheetHeader,
  Footer: SheetFooter,
  Portal: SheetPortal,
  Positioner: SheetPositioner,
  Title: SheetTitle,
  Description: SheetDescription,
}

export {
  useDialog,
  useDialogContext,
  Sheet,
  type SheetBackdropProps,
  type SheetCloseTriggerProps,
  type SheetRootProps,
  type SheetRootProviderProps,
  type SheetTriggerProps,
  type SheetContentProps,
  type SheetContextProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetPortalProps,
  type SheetPositionerProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
}
