import { useNavigationMenu, useNavigationMenuContext } from "@ark-ui/react"
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { NavigationMenu as NavigationMenuPrimitive } from "@ark-ui/react"
import { ChevronDownIcon } from "lucide-react"

function NavigationMenuRoot({ className, children, viewport = true, ...props }: NavigationMenuRootProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          {viewport && (
            <NavigationMenuViewportPositioner>
              <NavigationMenuViewport />
            </NavigationMenuViewportPositioner>
          )}
        </>
      )}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuContext({ ...props }: NavigationMenuContextProps) {
  return <NavigationMenuPrimitive.Context {...props} />
}

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-0", className)}
      {...props}
    />
  )
}

function NavigationMenuItem({ className, value, ...props }: NavigationMenuItemProps) {
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

function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}{" "}
          <ChevronDownIcon
            className="relative top-px ml-1 size-3 transition duration-300 group-data-open/navigation-menu-trigger:rotate-180"
            aria-hidden="true"
          />
        </>
      )}
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
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

function NavigationMenuViewportPositioner({ className, ...props }: NavigationMenuViewportPositionerProps) {
  return (
    <NavigationMenuPrimitive.ViewportPositioner
      data-slot="navigation-menu-viewport-positioner"
      className={cn("absolute top-full left-0 isolate z-50 flex w-full justify-center", className)}
      {...props}
    />
  )
}

function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
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

function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
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

function NavigationMenuIndicator({ className, ...props }: NavigationMenuIndicatorProps) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "absolute top-full left-0 z-1 flex h-1.5 w-(--trigger-width) translate-x-(--trigger-x) items-end justify-center overflow-hidden transition-[width,transform] duration-200 data-open:animate-in data-open:fade-in data-closed:animate-out data-closed:fade-out",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
        </>
      )}
    </NavigationMenuPrimitive.Indicator>
  )
}

function NavigationMenuArrow({ className, ...props }: NavigationMenuArrowProps) {
  return <NavigationMenuPrimitive.Arrow data-slot="navigation-menu-arrow" className={cn(className)} {...props} />
}

/** Marks the active item inside `NavigationMenuIndicator` (the sliding pointer). */
function NavigationMenuItemIndicator({ className, children, ...props }: NavigationMenuItemIndicatorProps) {
  return (
    <NavigationMenuPrimitive.ItemIndicator
      data-slot="navigation-menu-item-indicator"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>{children ?? <span className="size-2 rotate-45 rounded-tl-sm bg-border" />}</>
      )}
    </NavigationMenuPrimitive.ItemIndicator>
  )
}

function NavigationMenuRootProvider({ className, ...props }: NavigationMenuRootProviderProps) {
  return (
    <NavigationMenuPrimitive.RootProvider
      data-slot="navigation-menu"
      className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    />
  )
}

type NavigationMenuRootProps = React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  /** Render content in the shared viewport instead of inline. */
  viewport?: boolean
}

type NavigationMenuRootProviderProps = React.ComponentProps<typeof NavigationMenuPrimitive.RootProvider>

type NavigationMenuArrowProps = React.ComponentProps<typeof NavigationMenuPrimitive.Arrow>

type NavigationMenuContentProps = React.ComponentProps<typeof NavigationMenuPrimitive.Content>

type NavigationMenuContextProps = React.ComponentProps<typeof NavigationMenuPrimitive.Context>

type NavigationMenuIndicatorProps = React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>

type NavigationMenuItemProps = Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Item>, "value"> & {
  /** Identifies the item. Auto-generated when omitted. */
  value?: string
}

type NavigationMenuLinkProps = React.ComponentProps<typeof NavigationMenuPrimitive.Link>

type NavigationMenuListProps = React.ComponentProps<typeof NavigationMenuPrimitive.List>

type NavigationMenuTriggerProps = React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>

type NavigationMenuViewportProps = React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>

type NavigationMenuViewportPositionerProps = React.ComponentProps<typeof NavigationMenuPrimitive.ViewportPositioner>

type NavigationMenuItemIndicatorProps = React.ComponentProps<typeof NavigationMenuPrimitive.ItemIndicator>

const NavigationMenu = {
  Root: NavigationMenuRoot,
  RootProvider: NavigationMenuRootProvider,
  Arrow: NavigationMenuArrow,
  Content: NavigationMenuContent,
  Context: NavigationMenuContext,
  Indicator: NavigationMenuIndicator,
  Item: NavigationMenuItem,
  Link: NavigationMenuLink,
  List: NavigationMenuList,
  Trigger: NavigationMenuTrigger,
  Viewport: NavigationMenuViewport,
  ViewportPositioner: NavigationMenuViewportPositioner,
  ItemIndicator: NavigationMenuItemIndicator,
}

export {
  useNavigationMenu,
  useNavigationMenuContext,
  NavigationMenu,
  navigationMenuTriggerStyle,
  type NavigationMenuRootProps,
  type NavigationMenuRootProviderProps,
  type NavigationMenuArrowProps,
  type NavigationMenuContentProps,
  type NavigationMenuContextProps,
  type NavigationMenuIndicatorProps,
  type NavigationMenuItemProps,
  type NavigationMenuLinkProps,
  type NavigationMenuListProps,
  type NavigationMenuTriggerProps,
  type NavigationMenuViewportProps,
  type NavigationMenuViewportPositionerProps,
  type NavigationMenuItemIndicatorProps,
}
