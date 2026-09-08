import { ark } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function KbdRoot({ className, ...props }: KbdRootProps) {
  return (
    <ark.kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: KbdGroupProps) {
  return <ark.kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />
}

type KbdRootProps = React.ComponentProps<typeof ark.kbd>

type KbdGroupProps = React.ComponentProps<typeof ark.div>

const Kbd = {
  Root: KbdRoot,
  Group: KbdGroup,
}

export { Kbd, type KbdRootProps, type KbdGroupProps }
