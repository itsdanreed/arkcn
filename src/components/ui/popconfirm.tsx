import * as React from "react"
import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverArrow, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

/**
 * Popconfirm — a lightweight inline confirmation on Ark's Popover, for
 * actions that need a "are you sure?" without a modal dialog. Compose it:
 * `Popconfirm` > `PopconfirmTrigger` + `PopconfirmContent` > (`PopconfirmHeader` >
 * `PopconfirmIcon` + `PopconfirmTitle` + `PopconfirmDescription`) + `PopconfirmFooter` >
 * `PopconfirmCancelTrigger` + `PopconfirmConfirmTrigger`. `PopconfirmConfirmTrigger` closes after `onConfirm`
 * unless the handler calls `event.preventDefault()`.
 */

function Popconfirm({ positioning, ...props }: React.ComponentProps<typeof Popover>) {
  return <Popover data-slot="popconfirm" positioning={{ placement: "top", gutter: 8, ...positioning }} {...props} />
}

function PopconfirmTrigger({ ...props }: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="popconfirm-trigger" {...props} />
}

function PopconfirmContent({
  className,
  children,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof PopoverContent> & { showArrow?: boolean }) {
  return (
    <PopoverContent
      data-slot="popconfirm-content"
      role="alertdialog"
      className={cn("w-72 gap-3 p-3", className)}
      {...props}
    >
      {showArrow && <PopoverArrow />}
      {children}
    </PopoverContent>
  )
}

function PopconfirmHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popconfirm-header"
      className={cn(
        "grid grid-cols-[auto_1fr] gap-x-0 gap-y-0.5 has-[>[data-slot=popconfirm-icon]]:gap-x-2",
        className
      )}
      {...props}
    />
  )
}

function PopconfirmIcon({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="popconfirm-icon"
      className={cn(
        "row-span-2 mt-0.5 flex size-5 items-center justify-center text-destructive [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children ?? <AlertTriangleIcon />}
    </span>
  )
}

function PopconfirmTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="popconfirm-title" className={cn("col-start-2 text-sm/tight font-semibold", className)} {...props} />
  )
}

function PopconfirmDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popconfirm-description"
      className={cn("col-start-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function PopconfirmFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="popconfirm-footer" className={cn("flex items-center justify-end gap-2", className)} {...props} />
  )
}

function PopconfirmCancelTrigger({
  variant = "outline",
  size = "sm",
  children = "Cancel",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <PopoverClose asChild>
      <Button data-slot="popconfirm-cancel-trigger" variant={variant} size={size} {...props}>
        {children}
      </Button>
    </PopoverClose>
  )
}

function PopconfirmConfirmTrigger({
  variant = "destructive",
  size = "sm",
  onConfirm,
  onClick,
  children = "Confirm",
  ...props
}: React.ComponentProps<typeof Button> & {
  /** Runs on click; call `event.preventDefault()` to keep the popconfirm open. */
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
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
  return stayOpen ? button : <PopoverClose asChild>{button}</PopoverClose>
}

export {
  Popconfirm,
  PopconfirmCancelTrigger,
  PopconfirmConfirmTrigger,
  PopconfirmContent,
  PopconfirmDescription,
  PopconfirmFooter,
  PopconfirmHeader,
  PopconfirmIcon,
  PopconfirmTitle,
  PopconfirmTrigger,
}
