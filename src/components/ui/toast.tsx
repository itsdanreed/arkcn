"use client"
import * as React from "react"
import { Toast as ToastPrimitive, useToastContext, createToaster } from "@ark-ui/react"
import { cn } from "@/lib/utils"
import { ark, mergeProps, Toaster as ToasterPrimitive, Portal } from "@ark-ui/react"

function ToastActionTrigger({ className, ...props }: ToastActionTriggerProps) {
  return (
    <ToastPrimitive.ActionTrigger
      data-slot="toast-action-trigger"
      className={cn(
        "mt-2 inline-flex h-8 w-fit items-center justify-center gap-1.5 rounded-lg border border-input px-2.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ToastCloseTrigger({ className, ...props }: ToastCloseTriggerProps) {
  return (
    <ToastPrimitive.CloseTrigger
      data-slot="toast-close-trigger"
      className={cn(
        "absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function ToastContext(props: ToastContextProps) {
  return <ToastPrimitive.Context {...props} />
}

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastRoot({ className, asChild, children, ...props }: ToastRootProps) {
  const api = useToastContext()
  const rootProps = {
    "data-slot": "toast",
    className: cn(
      "relative flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-lg border bg-popover p-4 pr-10 text-popover-foreground shadow-lg",
      className
    ),
    ...props,
  }
  if (!asChild) return <ToastPrimitive.Root {...rootProps}>{children}</ToastPrimitive.Root>
  // Ark 5.39.1 renders a fixed div here despite declaring asChild. Preserve its
  // hover bridges when replacing the root through the factory.
  const child = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>
  return (
    <ark.div {...mergeProps(api.getRootProps(), rootProps)} asChild>
      {React.cloneElement(
        child,
        {},
        <>
          <div {...api.getGhostBeforeProps()} />
          {child.props.children}
          <div {...api.getGhostAfterProps()} />
        </>
      )}
    </ark.div>
  )
}

function ToastToaster(props: ToastToasterProps) {
  return (
    <Portal>
      <ToasterPrimitive data-slot="toaster" {...props} />
    </Portal>
  )
}

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("text-sm font-semibold", className)} {...props} />
}

type ToastRootProps = React.ComponentProps<typeof ToastPrimitive.Root>

type ToastActionTriggerProps = React.ComponentProps<typeof ToastPrimitive.ActionTrigger>

type ToastCloseTriggerProps = React.ComponentProps<typeof ToastPrimitive.CloseTrigger>

type ToastContextProps = React.ComponentProps<typeof ToastPrimitive.Context>

type ToastDescriptionProps = React.ComponentProps<typeof ToastPrimitive.Description>

type ToastTitleProps = React.ComponentProps<typeof ToastPrimitive.Title>

type ToastToasterProps = Omit<React.ComponentProps<typeof ToasterPrimitive>, "asChild">

const Toast = {
  Root: ToastRoot,
  ActionTrigger: ToastActionTrigger,
  CloseTrigger: ToastCloseTrigger,
  Context: ToastContext,
  Description: ToastDescription,
  Title: ToastTitle,
  Toaster: ToastToaster,
}

export {
  Toast,
  useToastContext,
  createToaster,
  type ToastRootProps,
  type ToastActionTriggerProps,
  type ToastCloseTriggerProps,
  type ToastContextProps,
  type ToastDescriptionProps,
  type ToastTitleProps,
  type ToastToasterProps,
}
