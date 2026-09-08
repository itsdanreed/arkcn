import { useScrollArea, useScrollAreaContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea as ScrollAreaPrimitive } from "@ark-ui/react"

function ScrollAreaRoot({ className, children, ...props }: ScrollAreaRootProps) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <ScrollAreaViewport>
            <ScrollAreaContent>{children}</ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollbar />
          <ScrollAreaCorner />
        </>
      )}
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollAreaContext({ ...props }: ScrollAreaContextProps) {
  return <ScrollAreaPrimitive.Context {...props} />
}

function ScrollAreaViewport({ className, ...props }: ScrollAreaViewportProps) {
  return (
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn(
        "no-scrollbar size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
        className
      )}
      {...props}
    />
  )
}

function ScrollAreaContent({ className, ...props }: ScrollAreaContentProps) {
  return (
    <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className={cn("min-w-full", className)} {...props} />
  )
}

function ScrollAreaScrollbar({ className, orientation = "vertical", ...props }: ScrollAreaScrollbarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-horizontal:not-data-overflow-x:hidden data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent data-vertical:not-data-overflow-y:hidden",
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
          <ScrollAreaThumb />
        </>
      )}
    </ScrollAreaPrimitive.Scrollbar>
  )
}

function ScrollAreaThumb({ className, ...props }: ScrollAreaThumbProps) {
  return (
    <ScrollAreaPrimitive.Thumb
      data-slot="scroll-area-thumb"
      className={cn("relative flex-1 rounded-full bg-border", className)}
      {...props}
    />
  )
}

function ScrollAreaCorner({ ...props }: ScrollAreaCornerProps) {
  return <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" {...props} />
}

function ScrollAreaRootProvider({ className, ...props }: ScrollAreaRootProviderProps) {
  return <ScrollAreaPrimitive.RootProvider data-slot="scroll-area" className={cn("relative", className)} {...props} />
}

type ScrollAreaScrollbarProps = React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>

type ScrollAreaRootProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root>

type ScrollAreaRootProviderProps = React.ComponentProps<typeof ScrollAreaPrimitive.RootProvider>

type ScrollAreaContentProps = React.ComponentProps<typeof ScrollAreaPrimitive.Content>

type ScrollAreaContextProps = React.ComponentProps<typeof ScrollAreaPrimitive.Context>

type ScrollAreaCornerProps = React.ComponentProps<typeof ScrollAreaPrimitive.Corner>

type ScrollAreaThumbProps = React.ComponentProps<typeof ScrollAreaPrimitive.Thumb>

type ScrollAreaViewportProps = React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>

const ScrollArea = {
  Scrollbar: ScrollAreaScrollbar,
  Root: ScrollAreaRoot,
  RootProvider: ScrollAreaRootProvider,
  Content: ScrollAreaContent,
  Context: ScrollAreaContext,
  Corner: ScrollAreaCorner,
  Thumb: ScrollAreaThumb,
  Viewport: ScrollAreaViewport,
}

export {
  useScrollArea,
  useScrollAreaContext,
  ScrollArea,
  type ScrollAreaScrollbarProps,
  type ScrollAreaRootProps,
  type ScrollAreaRootProviderProps,
  type ScrollAreaContentProps,
  type ScrollAreaContextProps,
  type ScrollAreaCornerProps,
  type ScrollAreaThumbProps,
  type ScrollAreaViewportProps,
}
