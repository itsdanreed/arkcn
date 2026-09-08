"use client"

import { ark } from "@ark-ui/react"
import { useDialog, useDialogContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog as DialogPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function DialogRoot({ lazyMount = true, unmountOnExit = true, ...props }: DialogRootProps) {
  return <DialogPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function DialogTrigger({ ...props }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPortalProps) {
  return <PortalPrimitive {...props} />
}

function DialogCloseTrigger({ ...props }: DialogCloseTriggerProps) {
  return <DialogPrimitive.CloseTrigger data-slot="dialog-close" {...props} />
}

function DialogContext({ ...props }: DialogContextProps) {
  return <DialogPrimitive.Context {...props} />
}

function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogPositioner({ className, ...props }: DialogPositionerProps) {
  return (
    <DialogPrimitive.Positioner
      data-slot="dialog-positioner"
      className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}
      {...props}
    />
  )
}

function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "relative grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.CloseTrigger data-slot="dialog-close" asChild>
              <Button variant="ghost" className="absolute top-2 right-2" size="icon-sm">
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.CloseTrigger>
          )}
        </DialogPrimitive.Content>
      </DialogPositioner>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <ark.div data-slot="dialog-header" className={cn("flex flex-col gap-2", className)} {...props} />
}

function DialogFooter({ className, showCloseButton = false, children, ...props }: DialogFooterProps) {
  return (
    <ark.div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.CloseTrigger asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.CloseTrigger>
      )}
    </ark.div>
  )
}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function DialogRootProvider(props: DialogRootProviderProps) {
  return <DialogPrimitive.RootProvider {...props} />
}

type DialogBackdropProps = React.ComponentProps<typeof DialogPrimitive.Backdrop>

type DialogCloseTriggerProps = React.ComponentProps<typeof DialogPrimitive.CloseTrigger>

type DialogRootProps = React.ComponentProps<typeof DialogPrimitive.Root>

type DialogRootProviderProps = React.ComponentProps<typeof DialogPrimitive.RootProvider>

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}

type DialogContextProps = React.ComponentProps<typeof DialogPrimitive.Context>

type DialogDescriptionProps = React.ComponentProps<typeof DialogPrimitive.Description>

type DialogFooterProps = React.ComponentProps<typeof ark.div> & {
  showCloseButton?: boolean
}

type DialogHeaderProps = React.ComponentProps<typeof ark.div>

type DialogPortalProps = React.ComponentProps<typeof PortalPrimitive>

type DialogPositionerProps = React.ComponentProps<typeof DialogPrimitive.Positioner>

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>

const Dialog = {
  Backdrop: DialogBackdrop,
  CloseTrigger: DialogCloseTrigger,
  Root: DialogRoot,
  RootProvider: DialogRootProvider,
  Content: DialogContent,
  Context: DialogContext,
  Description: DialogDescription,
  Footer: DialogFooter,
  Header: DialogHeader,
  Portal: DialogPortal,
  Positioner: DialogPositioner,
  Title: DialogTitle,
  Trigger: DialogTrigger,
}

export {
  useDialog,
  useDialogContext,
  Dialog,
  type DialogBackdropProps,
  type DialogCloseTriggerProps,
  type DialogRootProps,
  type DialogRootProviderProps,
  type DialogContentProps,
  type DialogContextProps,
  type DialogDescriptionProps,
  type DialogFooterProps,
  type DialogHeaderProps,
  type DialogPortalProps,
  type DialogPositionerProps,
  type DialogTitleProps,
  type DialogTriggerProps,
}
