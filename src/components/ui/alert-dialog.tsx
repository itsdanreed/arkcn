import { ark } from "@ark-ui/react"
import { useDialog, useDialogContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as AlertDialogPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

import { Button } from "@/components/ui/button"

function getDefaultInitialFocusEl() {
  return document.querySelector<HTMLElement>(
    '[data-slot="alert-dialog-content"][data-state="open"] [data-slot="alert-dialog-cancel"]'
  )
}

function AlertDialogRoot({
  role = "alertdialog",
  closeOnInteractOutside = false,
  initialFocusEl = getDefaultInitialFocusEl,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: AlertDialogRootProps) {
  return (
    <AlertDialogPrimitive.Root
      role={role}
      closeOnInteractOutside={closeOnInteractOutside}
      initialFocusEl={initialFocusEl}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function AlertDialogTrigger({ ...props }: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: AlertDialogPortalProps) {
  return <PortalPrimitive {...props} />
}

function AlertDialogContext({ ...props }: AlertDialogContextProps) {
  return <AlertDialogPrimitive.Context {...props} />
}

function AlertDialogBackdrop({ className, ...props }: AlertDialogBackdropProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogPositioner({ className, ...props }: AlertDialogPositionerProps) {
  return (
    <AlertDialogPrimitive.Positioner
      data-slot="alert-dialog-positioner"
      className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}
      {...props}
    />
  )
}

function AlertDialogContent({ className, size = "default", ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogPositioner>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          data-size={size}
          className={cn(
            "group/alert-dialog-content relative grid w-full gap-4 rounded-xl bg-popover p-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </AlertDialogPositioner>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <ark.div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <ark.div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  return (
    <ark.div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-heading text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogCloseTrigger({
  className,
  variant = "default",
  size = "default",
  ...props
}: AlertDialogCloseTriggerProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.CloseTrigger data-slot="alert-dialog-action" className={cn(className)} {...props} />
    </Button>
  )
}

function AlertDialogCancel({ className, variant = "outline", size = "default", ...props }: AlertDialogCancelProps) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.CloseTrigger data-slot="alert-dialog-cancel" className={cn(className)} {...props} />
    </Button>
  )
}

function AlertDialogRootProvider(props: AlertDialogRootProviderProps) {
  return <AlertDialogPrimitive.RootProvider {...props} />
}

type AlertDialogBackdropProps = React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>

type AlertDialogCloseTriggerProps = React.ComponentProps<typeof AlertDialogPrimitive.CloseTrigger> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">

type AlertDialogRootProps = React.ComponentProps<typeof AlertDialogPrimitive.Root>

type AlertDialogRootProviderProps = React.ComponentProps<typeof AlertDialogPrimitive.RootProvider>

type AlertDialogCancelProps = React.ComponentProps<typeof AlertDialogPrimitive.CloseTrigger> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">

type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}

type AlertDialogContextProps = React.ComponentProps<typeof AlertDialogPrimitive.Context>

type AlertDialogDescriptionProps = React.ComponentProps<typeof AlertDialogPrimitive.Description>

type AlertDialogFooterProps = React.ComponentProps<typeof ark.div>

type AlertDialogHeaderProps = React.ComponentProps<typeof ark.div>

type AlertDialogMediaProps = React.ComponentProps<typeof ark.div>

type AlertDialogPortalProps = React.ComponentProps<typeof PortalPrimitive>

type AlertDialogPositionerProps = React.ComponentProps<typeof AlertDialogPrimitive.Positioner>

type AlertDialogTitleProps = React.ComponentProps<typeof AlertDialogPrimitive.Title>

type AlertDialogTriggerProps = React.ComponentProps<typeof AlertDialogPrimitive.Trigger>

const AlertDialog = {
  Backdrop: AlertDialogBackdrop,
  CloseTrigger: AlertDialogCloseTrigger,
  Root: AlertDialogRoot,
  RootProvider: AlertDialogRootProvider,
  Cancel: AlertDialogCancel,
  Content: AlertDialogContent,
  Context: AlertDialogContext,
  Description: AlertDialogDescription,
  Footer: AlertDialogFooter,
  Header: AlertDialogHeader,
  Media: AlertDialogMedia,
  Portal: AlertDialogPortal,
  Positioner: AlertDialogPositioner,
  Title: AlertDialogTitle,
  Trigger: AlertDialogTrigger,
}

export {
  useDialog,
  useDialogContext,
  AlertDialog,
  type AlertDialogBackdropProps,
  type AlertDialogCloseTriggerProps,
  type AlertDialogRootProps,
  type AlertDialogRootProviderProps,
  type AlertDialogCancelProps,
  type AlertDialogContentProps,
  type AlertDialogContextProps,
  type AlertDialogDescriptionProps,
  type AlertDialogFooterProps,
  type AlertDialogHeaderProps,
  type AlertDialogMediaProps,
  type AlertDialogPortalProps,
  type AlertDialogPositionerProps,
  type AlertDialogTitleProps,
  type AlertDialogTriggerProps,
}
