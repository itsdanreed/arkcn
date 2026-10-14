import { ark, useEnvironmentContext } from "@ark-ui/react"
import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "./button"
import { Popover, usePopoverContext } from "./popover"
import { cn } from "../../lib/utils"

/**
 * Popconfirm — a lightweight inline confirmation on Ark's Popover, for
 * actions that need a "are you sure?" without a modal dialog. Compose it:
 * `Popconfirm` > `PopconfirmTrigger` + `PopconfirmContent` > (`PopconfirmHeader` >
 * `PopconfirmIcon` + `PopconfirmTitle` + `PopconfirmDescription`) + `PopconfirmFooter` >
 * `PopconfirmCancelTrigger` + `PopconfirmConfirmTrigger`. `PopconfirmConfirmTrigger` closes after `onConfirm`
 * unless the handler calls `event.preventDefault()`.
 */

function PopconfirmRoot({ positioning, ...props }: PopconfirmRootProps) {
  return (
    <Popover.Root
      data-slot="popconfirm"
      positioning={{ placement: "top", gutter: 8, overflowPadding: 5, ...positioning }}
      {...props}
    />
  )
}

function PopconfirmTrigger({ ...props }: PopconfirmTriggerProps) {
  return <Popover.Trigger data-slot="popconfirm-trigger" {...props} />
}

function PopconfirmContent({ className, children, showArrow = true, ...props }: PopconfirmContentProps) {
  const api = usePopoverContext()
  const { getRootNode } = useEnvironmentContext()
  const titleId = api.getTitleProps().id
  const descriptionId = api.getDescriptionProps().id
  const [labels, setLabels] = React.useState<{ title?: string; description?: string }>({})
  // The primitive checks these only at machine entry, before lazy content mounts.
  React.useLayoutEffect(() => {
    if (!api.open) return
    const scope = getRootNode() as Document | ShadowRoot
    if (!("getElementById" in scope)) return
    const update = () => {
      const title = titleId && scope.getElementById(titleId) ? titleId : undefined
      const description = descriptionId && scope.getElementById(descriptionId) ? descriptionId : undefined
      setLabels((previous) =>
        previous.title === title && previous.description === description ? previous : { title, description }
      )
    }
    // Presence can mount the portal after this component's layout effect.
    const observer = new MutationObserver(update)
    observer.observe(scope, { childList: true, subtree: true })
    update()
    return () => observer.disconnect()
  }, [api.open, children, getRootNode, titleId, descriptionId])
  return (
    <Popover.Content
      data-slot="popconfirm-content"
      role="alertdialog"
      aria-labelledby={props["aria-label"] ? undefined : labels.title}
      aria-describedby={labels.description}
      className={cn("w-72", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {showArrow && <Popover.Arrow />}
          {children}
        </>
      )}
    </Popover.Content>
  )
}

function PopconfirmHeader({ className, ...props }: PopconfirmHeaderProps) {
  return (
    <ark.div
      data-slot="popconfirm-header"
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-0 gap-y-0.5 has-[>[data-slot=popconfirm-icon]]:gap-x-2",
        className
      )}
      {...props}
    />
  )
}

function PopconfirmIcon({ className, children, ...props }: PopconfirmIconProps) {
  return (
    <ark.span
      data-slot="popconfirm-icon"
      className={cn(
        "row-span-2 mt-0.5 flex size-5 items-center justify-center text-destructive [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <AlertTriangleIcon />}</>}
    </ark.span>
  )
}

function PopconfirmTitle({ className, ...props }: PopconfirmTitleProps) {
  return (
    <Popover.Title asChild data-slot="popconfirm-title">
      <ark.p className={cn("col-start-2", className)} {...props} />
    </Popover.Title>
  )
}

function PopconfirmDescription({ className, ...props }: PopconfirmDescriptionProps) {
  return (
    <Popover.Description asChild data-slot="popconfirm-description">
      <ark.p className={cn("col-start-2", className)} {...props} />
    </Popover.Description>
  )
}

function PopconfirmFooter({ className, ...props }: PopconfirmFooterProps) {
  return (
    <ark.div
      data-slot="popconfirm-footer"
      className={cn("flex items-center justify-end gap-2", className)}
      {...props}
    />
  )
}

function PopconfirmCancelTrigger({
  variant = "outline",
  size = "sm",
  children = "Cancel",
  onClick,
  ...props
}: PopconfirmCancelTriggerProps) {
  const api = usePopoverContext()
  return (
    <Button
      data-slot="popconfirm-cancel-trigger"
      variant={variant}
      size={size}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) api.setOpen(false)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

function PopconfirmConfirmTrigger({
  variant = "destructive",
  size = "sm",
  onConfirm,
  onClick,
  children = "Confirm",
  ...props
}: PopconfirmConfirmTriggerProps) {
  const api = usePopoverContext()
  return (
    <Button
      data-slot="popconfirm-confirm-trigger"
      variant={variant}
      size={size}
      onClick={(event) => {
        onClick?.(event)
        onConfirm?.(event)
        if (!event.defaultPrevented) api.setOpen(false)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

type PopconfirmRootProps = React.ComponentProps<typeof Popover.Root>

type PopconfirmCancelTriggerProps = React.ComponentProps<typeof Button>

type PopconfirmConfirmTriggerProps = React.ComponentProps<typeof Button> & {
  /** Runs on click; call `event.preventDefault()` to keep the popconfirm open. */
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

type PopconfirmContentProps = React.ComponentProps<typeof Popover.Content> & { showArrow?: boolean }

type PopconfirmDescriptionProps = React.ComponentProps<typeof ark.p>

type PopconfirmFooterProps = React.ComponentProps<typeof ark.div>

type PopconfirmHeaderProps = React.ComponentProps<typeof ark.div>

type PopconfirmIconProps = React.ComponentProps<typeof ark.span>

type PopconfirmTitleProps = React.ComponentProps<typeof ark.p>

type PopconfirmTriggerProps = React.ComponentProps<typeof Popover.Trigger>

const Popconfirm = {
  Root: PopconfirmRoot,
  CancelTrigger: PopconfirmCancelTrigger,
  ConfirmTrigger: PopconfirmConfirmTrigger,
  Content: PopconfirmContent,
  Description: PopconfirmDescription,
  Footer: PopconfirmFooter,
  Header: PopconfirmHeader,
  Icon: PopconfirmIcon,
  Title: PopconfirmTitle,
  Trigger: PopconfirmTrigger,
}

export {
  Popconfirm,
  type PopconfirmRootProps,
  type PopconfirmCancelTriggerProps,
  type PopconfirmConfirmTriggerProps,
  type PopconfirmContentProps,
  type PopconfirmDescriptionProps,
  type PopconfirmFooterProps,
  type PopconfirmHeaderProps,
  type PopconfirmIconProps,
  type PopconfirmTitleProps,
  type PopconfirmTriggerProps,
}
