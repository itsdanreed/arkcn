import { ark } from "@ark-ui/react"
import { useDrawer, useDrawerContext, useDrawerStackContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { Drawer as DrawerPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"

type DrawerDirection = "top" | "bottom" | "left" | "right"

const swipeDirectionByDirection = {
  bottom: "down",
  top: "up",
  left: "start",
  right: "end",
} as const

function DrawerRoot({
  direction = "bottom",
  swipeDirection,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: DrawerRootProps) {
  return (
    <DrawerPrimitive.Root
      swipeDirection={swipeDirection ?? swipeDirectionByDirection[direction]}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
  )
}

function DrawerTrigger({ ...props }: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({ ...props }: DrawerPortalProps) {
  return <PortalPrimitive {...props} />
}

function DrawerContext({ ...props }: DrawerContextProps) {
  return <DrawerPrimitive.Context {...props} />
}

function DrawerCloseTrigger({ ...props }: DrawerCloseTriggerProps) {
  return <DrawerPrimitive.CloseTrigger data-slot="drawer-close" {...props} />
}

function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerPositioner({ className, ...props }: DrawerPositionerProps) {
  return (
    <DrawerPrimitive.Positioner
      data-slot="drawer-positioner"
      className={cn("fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

function DrawerGrabber({ className, ...props }: DrawerGrabberProps) {
  return (
    <DrawerPrimitive.Grabber
      data-slot="drawer-grabber"
      className={cn(
        "relative z-10 flex shrink-0 cursor-grab touch-none group-data-[swipe-direction=down]/drawer-content:h-3 group-data-[swipe-direction=down]/drawer-content:w-full group-data-[swipe-direction=down]/drawer-content:items-end group-data-[swipe-direction=down]/drawer-content:justify-center group-data-[swipe-direction=left]/drawer-content:order-last group-data-[swipe-direction=left]/drawer-content:h-full group-data-[swipe-direction=left]/drawer-content:w-3 group-data-[swipe-direction=left]/drawer-content:items-center group-data-[swipe-direction=left]/drawer-content:justify-start group-data-[swipe-direction=right]/drawer-content:h-full group-data-[swipe-direction=right]/drawer-content:w-3 group-data-[swipe-direction=right]/drawer-content:items-center group-data-[swipe-direction=right]/drawer-content:justify-end group-data-[swipe-direction=up]/drawer-content:order-last group-data-[swipe-direction=up]/drawer-content:h-3 group-data-[swipe-direction=up]/drawer-content:w-full group-data-[swipe-direction=up]/drawer-content:items-start group-data-[swipe-direction=up]/drawer-content:justify-center active:cursor-grabbing",
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
          <DrawerPrimitive.GrabberIndicator
            data-slot="drawer-grabber-indicator"
            className="block h-1 w-24 shrink-0 rounded-full bg-muted group-data-[swipe-direction=left]/drawer-content:h-24 group-data-[swipe-direction=left]/drawer-content:w-1 group-data-[swipe-direction=right]/drawer-content:h-24 group-data-[swipe-direction=right]/drawer-content:w-1"
          />
        </>
      )}
    </DrawerPrimitive.Grabber>
  )
}

function DrawerContent({
  className,
  children,
  container,
  showBackdrop = true,
  showSwipeHandle = false,
  inset = false,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal container={container}>
      {showBackdrop && <DrawerBackdrop className={container ? "absolute" : undefined} />}
      <DrawerPositioner className={container ? "absolute" : undefined}>
        <DrawerPrimitive.Content
          data-slot="drawer-content"
          data-inset={inset ? "" : undefined}
          className={cn(
            "group/drawer-content absolute flex h-auto flex-col bg-popover text-sm text-popover-foreground outline-hidden transition-[transform,height,opacity,filter] duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] data-inset:rounded-xl data-inset:border data-inset:shadow-lg data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[calc(100%-6rem)] data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t data-inset:data-[swipe-direction=down]:inset-x-2 data-inset:data-[swipe-direction=down]:bottom-2 data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:flex-row data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-inset:data-[swipe-direction=left]:inset-y-2 data-inset:data-[swipe-direction=left]:left-2 data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:flex-row data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-inset:data-[swipe-direction=right]:inset-y-2 data-inset:data-[swipe-direction=right]:right-2 data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[calc(100%-6rem)] data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:border-b data-inset:data-[swipe-direction=up]:inset-x-2 data-inset:data-[swipe-direction=up]:top-2 data-[swipe-direction=left]:sm:max-w-sm data-[swipe-direction=right]:sm:max-w-sm data-open:animate-in data-[swipe-direction=down]:data-open:slide-in-from-bottom-[calc(100%+2px)] data-[swipe-direction=left]:data-open:slide-in-from-left-[calc(100%+2px)] data-[swipe-direction=right]:data-open:slide-in-from-right-[calc(100%+2px)] data-[swipe-direction=up]:data-open:slide-in-from-top-[calc(100%+2px)] data-closed:animate-out data-closed:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[swipe-direction=down]:data-closed:slide-out-to-bottom-[calc(100%+2px)] data-[swipe-direction=left]:data-closed:slide-out-to-left-[calc(100%+2px)] data-[swipe-direction=right]:data-closed:slide-out-to-right-[calc(100%+2px)] data-[swipe-direction=up]:data-closed:slide-out-to-top-[calc(100%+2px)]",
            className
          )}
          {...props}
        >
          {props.asChild ? (
            React.isValidElement(children) ? (
              children
            ) : null
          ) : (
            <>
              {showSwipeHandle && <DrawerGrabber />}
              <div
                data-slot="drawer-body"
                className="flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain rounded-[inherit]"
              >
                {children}
              </div>
            </>
          )}
        </DrawerPrimitive.Content>
      </DrawerPositioner>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <ark.div
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 flex-col gap-0.5 p-4 pb-0 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <ark.div
      data-slot="drawer-footer"
      className={cn("mt-auto flex shrink-0 flex-col gap-2 p-4 pt-0", className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-heading text-base font-medium text-foreground", className)}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-balance text-muted-foreground", className)}
      {...props}
    />
  )
}

function DrawerSwipeArea({ ...props }: DrawerSwipeAreaProps) {
  return <DrawerPrimitive.SwipeArea data-slot="drawer-swipe-area" {...props} />
}

/** Wrap page content in a stack so nested drawers push it back (`Drawer` parts inside read the stack). */
function DrawerStack({ ...props }: DrawerStackProps) {
  return <DrawerPrimitive.Stack data-slot="drawer-stack" {...props} />
}

/** The layer that scales and shifts back when a drawer opens over it. */
function DrawerIndent({ className, ...props }: DrawerIndentProps) {
  return (
    <DrawerPrimitive.Indent
      data-slot="drawer-indent"
      className={cn("origin-center transition-transform duration-300 ease-out", className)}
      {...props}
    />
  )
}

function DrawerIndentBackground({ className, ...props }: DrawerIndentBackgroundProps) {
  return (
    <DrawerPrimitive.IndentBackground
      data-slot="drawer-indent-background"
      className={cn("fixed inset-0 bg-black", className)}
      {...props}
    />
  )
}

function DrawerRootProvider(props: DrawerRootProviderProps) {
  return <DrawerPrimitive.RootProvider {...props} />
}

function DrawerGrabberIndicator({ className, ...props }: DrawerGrabberIndicatorProps) {
  return <DrawerPrimitive.GrabberIndicator data-slot="drawer-grabber-indicator" className={cn(className)} {...props} />
}

type DrawerBackdropProps = React.ComponentProps<typeof DrawerPrimitive.Backdrop>

type DrawerCloseTriggerProps = React.ComponentProps<typeof DrawerPrimitive.CloseTrigger>

type DrawerGrabberIndicatorProps = React.ComponentProps<typeof DrawerPrimitive.GrabberIndicator>

type DrawerRootProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  /** Edge the drawer slides in from. Maps to Ark's `swipeDirection`. */
  direction?: DrawerDirection
}

type DrawerRootProviderProps = React.ComponentProps<typeof DrawerPrimitive.RootProvider>

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  /** Renders the drawer inside this element instead of the body, positioned against it rather than the viewport. */
  container?: React.RefObject<HTMLElement | null>
  /** Floats the drawer a small margin from the edges with all corners rounded, instead of flush against its side. */
  inset?: boolean
  /** Dims what's behind the drawer. Turn it off for a non-modal drawer (`modal={false}` on the root) so the page stays interactive. */
  showBackdrop?: boolean
  /** Shows the optional swipe handle. Omit it when the content supplies its own handle. */
  showSwipeHandle?: boolean
}

type DrawerContextProps = React.ComponentProps<typeof DrawerPrimitive.Context>

type DrawerDescriptionProps = React.ComponentProps<typeof DrawerPrimitive.Description>

type DrawerFooterProps = React.ComponentProps<typeof ark.div>

type DrawerGrabberProps = React.ComponentProps<typeof DrawerPrimitive.Grabber>

type DrawerHeaderProps = React.ComponentProps<typeof ark.div>

type DrawerPortalProps = React.ComponentProps<typeof PortalPrimitive>

type DrawerPositionerProps = React.ComponentProps<typeof DrawerPrimitive.Positioner>

type DrawerSwipeAreaProps = React.ComponentProps<typeof DrawerPrimitive.SwipeArea>

type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>

type DrawerTriggerProps = React.ComponentProps<typeof DrawerPrimitive.Trigger>

type DrawerIndentProps = React.ComponentProps<typeof DrawerPrimitive.Indent>

type DrawerIndentBackgroundProps = React.ComponentProps<typeof DrawerPrimitive.IndentBackground>

type DrawerStackProps = React.ComponentProps<typeof DrawerPrimitive.Stack>

const Drawer = {
  Backdrop: DrawerBackdrop,
  CloseTrigger: DrawerCloseTrigger,
  GrabberIndicator: DrawerGrabberIndicator,
  Root: DrawerRoot,
  RootProvider: DrawerRootProvider,
  Content: DrawerContent,
  Context: DrawerContext,
  Description: DrawerDescription,
  Footer: DrawerFooter,
  Grabber: DrawerGrabber,
  Header: DrawerHeader,
  Portal: DrawerPortal,
  Positioner: DrawerPositioner,
  SwipeArea: DrawerSwipeArea,
  Title: DrawerTitle,
  Trigger: DrawerTrigger,
  Indent: DrawerIndent,
  IndentBackground: DrawerIndentBackground,
  Stack: DrawerStack,
}

export {
  useDrawer,
  useDrawerContext,
  useDrawerStackContext,
  Drawer,
  type DrawerBackdropProps,
  type DrawerCloseTriggerProps,
  type DrawerGrabberIndicatorProps,
  type DrawerRootProps,
  type DrawerRootProviderProps,
  type DrawerContentProps,
  type DrawerContextProps,
  type DrawerDescriptionProps,
  type DrawerFooterProps,
  type DrawerGrabberProps,
  type DrawerHeaderProps,
  type DrawerPortalProps,
  type DrawerPositionerProps,
  type DrawerSwipeAreaProps,
  type DrawerTitleProps,
  type DrawerTriggerProps,
  type DrawerIndentProps,
  type DrawerIndentBackgroundProps,
  type DrawerStackProps,
}
