import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { ark } from "@ark-ui/react"

import { Separator } from "./separator"

const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "*:data-slot:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg! [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0",
        vertical:
          "flex-col *:data-slot:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg! [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroupRoot({ className, orientation = "horizontal", ...props }: ButtonGroupRootProps) {
  return (
    <ark.div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({ className, asChild = false, ...props }: ButtonGroupTextProps) {
  const Comp = ark.div

  return (
    <Comp
      asChild={asChild}
      data-slot="button-group-text"
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: ButtonGroupSeparatorProps) {
  return (
    <Separator.Root
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      )}
      {...props}
    />
  )
}

type ButtonGroupRootProps = React.ComponentProps<typeof ark.div> & VariantProps<typeof buttonGroupVariants>

type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator.Root>

type ButtonGroupTextProps = React.ComponentProps<typeof ark.div> & {
  asChild?: boolean
}

const ButtonGroup = {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
  Text: ButtonGroupText,
}

export {
  ButtonGroup,
  buttonGroupVariants,
  type ButtonGroupRootProps,
  type ButtonGroupSeparatorProps,
  type ButtonGroupTextProps,
}
