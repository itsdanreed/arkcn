import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { NavigationMenu as NavigationMenuPrimitive } from "@ark-ui/react"
import { ChevronDownIcon } from "lucide-react"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  /** Render content in the shared viewport instead of inline. */
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
      {viewport && (
        <NavigationMenuViewportPositioner>
          <NavigationMenuViewport />
        </NavigationMenuViewportPositioner>
      )}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuContext({ ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Context>) {
  return <NavigationMenuPrimitive.Context {...props} />
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-0", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  value,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Item>, "value"> & {
  /** Identifies the item. Auto-generated when omitted. */
  value?: string
}) {
  const id = React.useId()
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      value={value ?? id}
      className={cn(
        // Ark measures the trigger via offsetLeft for the indicator, so the
        // item must not be the offset parent while a viewport is rendered.
        "group-data-[viewport=false]/navigation-menu:relative",
        className
      )}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus-visible:bg-muted"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 transition duration-300 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-1 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-lg group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow-sm group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:ring-foreground/10 group-data-[viewport=false]/navigation-menu:duration-300 **:data-[slot=navigation-menu-link]:focus-visible:ring-0 **:data-[slot=navigation-menu-link]:focus-visible:outline-none md:absolute md:w-auto data-open:animate-in data-open:fade-in group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewportPositioner({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.ViewportPositioner>) {
  return (
    <NavigationMenuPrimitive.ViewportPositioner
      data-slot="navigation-menu-viewport-positioner"
      className={cn("absolute top-full left-0 isolate z-50 flex w-full justify-center", className)}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <NavigationMenuPrimitive.Viewport
      data-slot="navigation-menu-viewport"
      className={cn(
        "relative mt-1.5 h-(--viewport-height) w-full origin-[top_center] overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-sm ring-1 ring-foreground/10 transition-[width,height] duration-100 md:w-(--viewport-width) data-open:animate-in data-open:zoom-in-90 data-closed:animate-out data-closed:zoom-out-90",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-current:bg-muted/50 data-current:hover:bg-muted data-current:focus-visible:bg-muted [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "absolute top-full left-0 z-1 flex h-1.5 w-(--trigger-width) translate-x-(--trigger-x) items-end justify-center overflow-hidden transition-[width,transform] duration-200 data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

function NavigationMenuArrow({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Arrow>) {
  return <NavigationMenuPrimitive.Arrow data-slot="navigation-menu-arrow" className={cn(className)} {...props} />
}

/** Marks the active item inside `NavigationMenuIndicator` (the sliding pointer). */
function NavigationMenuItemIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.ItemIndicator>) {
  return (
    <NavigationMenuPrimitive.ItemIndicator
      data-slot="navigation-menu-item-indicator"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {children ?? <span className="size-2 rotate-45 rounded-tl-sm bg-border" />}
    </NavigationMenuPrimitive.ItemIndicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuArrow,
  NavigationMenuContent,
  NavigationMenuContext,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenuViewportPositioner,
  navigationMenuTriggerStyle,
  NavigationMenuItemIndicator,
}
