"use client"
import * as React from "react"
import { Toast as ToastPrimitive, useToastContext, createToaster as createArkToaster } from "@ark-ui/react"
import { cn } from "../../lib/utils"
import { Button } from "./button"
import { XIcon } from "lucide-react"
import { ark, mergeProps, Toaster as ToasterPrimitive, Portal } from "@ark-ui/react"

function createToaster<T = React.ReactNode>(props: Parameters<typeof createArkToaster>[0]) {
  return createArkToaster<T>({ gap: 12, overlap: true, removeDelay: 500, ...props })
}

function ToastActionTrigger({ className, ...props }: ToastActionTriggerProps) {
  return (
    <Button asChild variant="outline" size="sm" className={cn("shrink-0", className)}>
      <ToastPrimitive.ActionTrigger data-slot="toast-action-trigger" {...props} />
    </Button>
  )
}

function ToastCloseTrigger({ className, children, ...props }: ToastCloseTriggerProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon-sm"
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 hover:text-foreground",
        className
      )}
    >
      <ToastPrimitive.CloseTrigger data-slot="toast-close-trigger" {...props}>
        {props.asChild ? children : (children ?? <XIcon />)}
      </ToastPrimitive.CloseTrigger>
    </Button>
  )
}

function ToastContent({ className, ...props }: ToastContentProps) {
  const toast = useToastContext().getRootProps() as Record<`data-${string}`, string | undefined>
  return (
    <ark.div
      data-slot="toast-content"
      data-behind={toast["data-sibling"]}
      data-expanded={toast["data-stack"]}
      className={cn(
        "flex items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100 motion-reduce:transition-none",
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

function ToastRoot({ className, asChild, children, style, ref, ...props }: ToastRootProps) {
  const api = useToastContext()
  const elementRef = React.useRef<HTMLDivElement>(null)
  const [naturalHeight, setNaturalHeight] = React.useState<number>()
  const [exitSnapshot, setExitSnapshot] = React.useState<{ transform: string; height: string }>()
  React.useImperativeHandle(ref, () => elementRef.current!)
  React.useLayoutEffect(() => {
    const element = elementRef.current
    const content = element?.querySelector<HTMLElement>('[data-slot="toast-content"]')
    if (!element || !content) return
    const measure = () => {
      const computed = element.ownerDocument.defaultView!.getComputedStyle(element)
      setNaturalHeight(
        content.offsetHeight + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth)
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [])
  const state = api.getRootProps() as Record<`data-${string}`, string | undefined>
  const expanded = state["data-stack"] !== undefined
  const frontmost = state["data-first"] !== undefined
  const entering = state["data-mounted"] === undefined
  const exiting = !api.visible
  const sliding = entering || (exiting && frontmost && !exitSnapshot)
  React.useLayoutEffect(() => {
    if (!exiting) {
      setExitSnapshot(undefined)
      return
    }
    if (frontmost || exitSnapshot || !elementRef.current) return
    const element = elementRef.current
    const computed = element.ownerDocument.defaultView!.getComputedStyle(element)
    // A middle card must not cross its neighbors or resize if the stack changes during its exit.
    setExitSnapshot({ transform: computed.transform, height: computed.height })
  }, [exiting, frontmost, exitSnapshot])
  const motionStyle = {
    height: expanded || frontmost ? naturalHeight : "var(--first-height)",
    "--toast-height": expanded ? "var(--initial-height)" : "var(--first-height, var(--initial-height))",
    "--toast-scale": expanded || sliding ? "1" : "max(0, calc(1 - var(--index) * 0.1))",
    "--toast-y": sliding
      ? "calc(var(--sign) * 150%)"
      : expanded
        ? "calc(var(--lift) * var(--offset))"
        : "calc(var(--lift) * (var(--index) * var(--gap) + (1 - var(--toast-scale)) * var(--toast-height)))",
    opacity: exiting && (!frontmost || exitSnapshot) ? 0 : 1,
    ...exitSnapshot,
    ...style,
  } as React.CSSProperties
  const rootProps = {
    "data-slot": "toast",
    ref: elementRef,
    style: motionStyle,
    className: cn(
      "relative z-(--z-index) flex w-96 max-w-[calc(100vw-2rem)] transform-[translate3d(var(--x),var(--toast-y),0)_scale(var(--toast-scale))] flex-col gap-1 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none select-none [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_300ms_cubic-bezier(0.22,1,0.36,1)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 has-data-[slot=toast-content]:block has-data-[slot=toast-content]:p-0 data-[side=bottom]:origin-bottom data-[side=top]:origin-top motion-reduce:transition-none",
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
  return <ToastPrimitive.Title data-slot="toast-title" className={cn("text-sm font-medium", className)} {...props} />
}

type ToastRootProps = React.ComponentProps<typeof ToastPrimitive.Root>

type ToastActionTriggerProps = React.ComponentProps<typeof ToastPrimitive.ActionTrigger>

type ToastCloseTriggerProps = React.ComponentProps<typeof ToastPrimitive.CloseTrigger>

type ToastContentProps = React.ComponentProps<typeof ark.div>

type ToastContextProps = React.ComponentProps<typeof ToastPrimitive.Context>

type ToastDescriptionProps = React.ComponentProps<typeof ToastPrimitive.Description>

type ToastTitleProps = React.ComponentProps<typeof ToastPrimitive.Title>

type ToastToasterProps = Omit<React.ComponentProps<typeof ToasterPrimitive>, "asChild">

const Toast = {
  Root: ToastRoot,
  ActionTrigger: ToastActionTrigger,
  CloseTrigger: ToastCloseTrigger,
  Context: ToastContext,
  Content: ToastContent,
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
  type ToastContentProps,
  type ToastDescriptionProps,
  type ToastTitleProps,
  type ToastToasterProps,
}
