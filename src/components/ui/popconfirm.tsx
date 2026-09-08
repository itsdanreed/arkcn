import { ark } from "@ark-ui/react"
import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
    <Popover.Root data-slot="popconfirm" positioning={{ placement: "top", gutter: 8, ...positioning }} {...props} />
  )
}

function PopconfirmTrigger({ ...props }: PopconfirmTriggerProps) {
  return <Popover.Trigger data-slot="popconfirm-trigger" {...props} />
}

function PopconfirmContent({ className, children, showArrow = true, ...props }: PopconfirmContentProps) {
  return (
    <Popover.Content
      data-slot="popconfirm-content"
      role="alertdialog"
      className={cn("w-72 gap-3 p-3", className)}
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
    <ark.p
      data-slot="popconfirm-title"
      className={cn("col-start-2 text-sm/tight font-semibold", className)}
      {...props}
    />
  )
}

function PopconfirmDescription({ className, ...props }: PopconfirmDescriptionProps) {
  return (
    <ark.p
      data-slot="popconfirm-description"
      className={cn("col-start-2 text-xs text-muted-foreground", className)}
      {...props}
    />
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
  ...props
}: PopconfirmCancelTriggerProps) {
  return (
    <Popover.CloseTrigger asChild>
      <Button data-slot="popconfirm-cancel-trigger" variant={variant} size={size} {...props}>
        {children}
      </Button>
    </Popover.CloseTrigger>
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
  const [stayOpen, setStayOpen] = React.useState(false)
  const button = (
    <Button
      data-slot="popconfirm-confirm-trigger"
      variant={variant}
      size={size}
      onClick={(event) => {
        onClick?.(event)
        onConfirm?.(event)
        setStayOpen(event.defaultPrevented)
      }}
      {...props}
    >
      {children}
    </Button>
  )
  return stayOpen ? button : <Popover.CloseTrigger asChild>{button}</Popover.CloseTrigger>
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
