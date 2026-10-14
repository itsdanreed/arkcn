"use client"

import {
  useSegmentGroup,
  useSegmentGroupContext,
  useSegmentGroupItemContext,
  useEnvironmentContext,
} from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { SegmentGroup as SegmentGroupPrimitive } from "@ark-ui/react"

function SegmentGroupRoot({ className, orientation = "horizontal", ...props }: SegmentGroupRootProps) {
  return (
    <SegmentGroupPrimitive.Root
      data-slot="segment-group"
      orientation={orientation}
      className={cn(
        "relative inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-0.75 text-muted-foreground data-vertical:h-auto data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

function SegmentGroupContext({ ...props }: SegmentGroupContextProps) {
  return <SegmentGroupPrimitive.Context {...props} />
}

function SegmentGroupLabel({ className, ...props }: SegmentGroupLabelProps) {
  return (
    <SegmentGroupPrimitive.Label
      data-slot="segment-group-label"
      className={cn("text-sm/none font-medium select-none", className)}
      {...props}
    />
  )
}

function SegmentGroupIndicator({ className, style, ...props }: SegmentGroupIndicatorProps) {
  const api = useSegmentGroupContext()
  const { getRootNode } = useEnvironmentContext()
  const rootId = api.getRootProps().id
  const itemId = api.value == null ? undefined : api.getItemProps({ value: api.value }).id
  const [rect, setRect] = React.useState<React.CSSProperties>({})

  // Zag's offset measurements round to whole pixels. Preserve fractional bounds
  // while leaving its indicator visibility and animation lifecycle in charge.
  React.useLayoutEffect(() => {
    const scope = getRootNode() as Document | ShadowRoot
    if (!("getElementById" in scope)) return
    const root = rootId ? scope.getElementById(rootId) : null
    const item = itemId ? scope.getElementById(itemId) : null
    if (!root || !item) return
    const measure = () => {
      const bounds = root.getBoundingClientRect()
      const selected = item.getBoundingClientRect()
      const css = root.ownerDocument.defaultView!.getComputedStyle(root)
      const number = (property: string) => parseFloat(css.getPropertyValue(property)) || 0
      const borderBox = (style: CSSStyleDeclaration, dimension: "width" | "height") => {
        const sides = dimension === "width" ? ["left", "right"] : ["top", "bottom"]
        return (
          parseFloat(style[dimension]) +
          (style.boxSizing === "border-box"
            ? 0
            : sides.reduce(
                (total, side) =>
                  total +
                  (parseFloat(style.getPropertyValue(`padding-${side}`)) || 0) +
                  (parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0),
                0
              ))
        )
      }
      const width = borderBox(css, "width")
      const height = borderBox(css, "height")
      const selectedCss = root.ownerDocument.defaultView!.getComputedStyle(item)
      if (!width || !height || !bounds.width || !bounds.height) return
      const scaleX = bounds.width / width
      const scaleY = bounds.height / height
      const next = {
        "--left": `${(selected.left - bounds.left) / scaleX - number("border-left-width") + root.scrollLeft}px`,
        "--top": `${(selected.top - bounds.top) / scaleY - number("border-top-width") + root.scrollTop}px`,
        "--width": `${borderBox(selectedCss, "width")}px`,
        "--height": `${borderBox(selectedCss, "height")}px`,
      } as React.CSSProperties
      setRect((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    // An earlier sibling changing width also moves the selected item.
    for (const child of root.querySelectorAll('[data-scope="segment-group"][data-part="item"]')) observer.observe(child)
    return () => observer.disconnect()
  }, [getRootNode, rootId, itemId])

  return (
    <SegmentGroupPrimitive.Indicator
      data-slot="segment-group-indicator"
      style={{ ...rect, ...style }}
      className={cn(
        "top-(--top) left-(--left) z-0 h-(--height) w-(--width) rounded-md border border-transparent bg-background shadow-sm [--transition-duration:150ms] [--transition-timing-function:cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none! dark:border-input dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function SegmentGroupItem({ className, children, ...props }: SegmentGroupItemProps) {
  return (
    <SegmentGroupPrimitive.Item
      data-slot="segment-group-item"
      className={cn(
        "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all select-none hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-focus-visible:outline-1 data-focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground data-checked:text-foreground dark:data-checked:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-vertical:w-full data-vertical:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          <SegmentGroupItemText>{children}</SegmentGroupItemText>
          <SegmentGroupItemControl />
          <SegmentGroupItemHiddenInput />
        </>
      )}
    </SegmentGroupPrimitive.Item>
  )
}

function SegmentGroupItemContext({ ...props }: SegmentGroupItemContextProps) {
  return <SegmentGroupPrimitive.ItemContext {...props} />
}

function SegmentGroupItemText({ ...props }: SegmentGroupItemTextProps) {
  return <SegmentGroupPrimitive.ItemText data-slot="segment-group-item-text" {...props} />
}

function SegmentGroupItemControl({ className, ...props }: SegmentGroupItemControlProps) {
  return (
    <SegmentGroupPrimitive.ItemControl
      data-slot="segment-group-item-control"
      className={cn("hidden", className)}
      {...props}
    />
  )
}

function SegmentGroupItemHiddenInput({ ...props }: SegmentGroupItemHiddenInputProps) {
  return <SegmentGroupPrimitive.ItemHiddenInput {...props} />
}

function SegmentGroupRootProvider({ className, ...props }: SegmentGroupRootProviderProps) {
  return (
    <SegmentGroupPrimitive.RootProvider
      data-slot="segment-group"
      className={cn(
        "relative inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-0.75 text-muted-foreground data-vertical:h-auto data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

type SegmentGroupRootProps = React.ComponentProps<typeof SegmentGroupPrimitive.Root>

type SegmentGroupRootProviderProps = React.ComponentProps<typeof SegmentGroupPrimitive.RootProvider>

type SegmentGroupContextProps = React.ComponentProps<typeof SegmentGroupPrimitive.Context>

type SegmentGroupIndicatorProps = React.ComponentProps<typeof SegmentGroupPrimitive.Indicator>

type SegmentGroupItemProps = React.ComponentProps<typeof SegmentGroupPrimitive.Item>

type SegmentGroupItemContextProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemContext>

type SegmentGroupItemControlProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemControl>

type SegmentGroupItemHiddenInputProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemHiddenInput>

type SegmentGroupItemTextProps = React.ComponentProps<typeof SegmentGroupPrimitive.ItemText>

type SegmentGroupLabelProps = React.ComponentProps<typeof SegmentGroupPrimitive.Label>

const SegmentGroup = {
  Root: SegmentGroupRoot,
  RootProvider: SegmentGroupRootProvider,
  Context: SegmentGroupContext,
  Indicator: SegmentGroupIndicator,
  Item: SegmentGroupItem,
  ItemContext: SegmentGroupItemContext,
  ItemControl: SegmentGroupItemControl,
  ItemHiddenInput: SegmentGroupItemHiddenInput,
  ItemText: SegmentGroupItemText,
  Label: SegmentGroupLabel,
}

export {
  useSegmentGroup,
  useSegmentGroupContext,
  useSegmentGroupItemContext,
  SegmentGroup,
  type SegmentGroupRootProps,
  type SegmentGroupRootProviderProps,
  type SegmentGroupContextProps,
  type SegmentGroupIndicatorProps,
  type SegmentGroupItemProps,
  type SegmentGroupItemContextProps,
  type SegmentGroupItemControlProps,
  type SegmentGroupItemHiddenInputProps,
  type SegmentGroupItemTextProps,
  type SegmentGroupLabelProps,
}
