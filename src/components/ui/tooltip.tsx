"use client"

import { ark, mergeProps, useTooltip, useTooltipContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Portal as PortalPrimitive, Tooltip as TooltipPrimitive } from "@ark-ui/react"

type TooltipProviderProps = {
  /** Delay before the tooltip opens, in ms. Maps to Ark's `openDelay`. */
  delayDuration?: number
  /** Delay before the tooltip closes, in ms. Maps to Ark's `closeDelay`. */
  closeDelay?: number
  /** When true the content cannot be hovered. Maps to Ark's `interactive: false`. */
  disableHoverableContent?: boolean
  children?: React.ReactNode
}

const TooltipProviderContext = React.createContext<Omit<TooltipProviderProps, "children">>({})

function TooltipProvider({ delayDuration = 0, closeDelay, disableHoverableContent, children }: TooltipProviderProps) {
  const value = React.useMemo(
    () => ({ delayDuration, closeDelay, disableHoverableContent }),
    [delayDuration, closeDelay, disableHoverableContent]
  )
  return <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>
}

/** Lets the trigger tell its tooltip which element id to position against (see `TooltipTrigger`). */
const TooltipTriggerIdContext = React.createContext<(id: string) => void>(() => {})

function TooltipRoot({
  openDelay,
  closeDelay,
  interactive,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ids,
  ...props
}: TooltipRootProps) {
  const provider = React.useContext(TooltipProviderContext)
  const [triggerId, setTriggerId] = React.useState<string>()
  return (
    <TooltipTriggerIdContext.Provider value={setTriggerId}>
      <TooltipPrimitive.Root
        openDelay={openDelay ?? provider.delayDuration ?? 0}
        closeDelay={closeDelay ?? provider.closeDelay}
        interactive={interactive ?? !provider.disableHoverableContent}
        positioning={{ placement: "top", gutter: 0, ...positioning }}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        ids={triggerId ? { ...ids, trigger: triggerId } : ids}
        {...props}
      />
    </TooltipTriggerIdContext.Provider>
  )
}

/**
 * The tooltip's anchor. It never claims the element's `id` or `data-state`: when it shares the element with
 * another trigger (`Popover.Trigger`, `Popconfirm.Trigger`, `DropdownMenu.Trigger`, ... in either
 * nesting order), that trigger's id stays, so its machine still recognises its own trigger, and
 * the tooltip adopts the id to position against. A trigger on its own gets the tooltip's id.
 */
function TooltipTrigger({ ref, ...props }: TooltipTriggerProps) {
  const tooltip = useTooltipContext()
  const adopt = React.useContext(TooltipTriggerIdContext)
  // Neither `id` nor `data-state` is claimed; another trigger on the element keeps its own.
  const {
    id: tooltipId,
    "data-state": _state,
    ...triggerProps
  } = tooltip.getTriggerProps() as React.ComponentProps<"button"> & { "data-state"?: string }
  const setRef = (element: HTMLButtonElement | null) => {
    if (element) {
      // An id no one else set is left unmanaged by React, so setting it here is stable.
      if (!element.id && tooltipId) element.id = tooltipId
      if (element.id) adopt(element.id)
    }
    if (typeof ref === "function") ref(element)
    else if (ref) ref.current = element
  }
  return <ark.button data-slot="tooltip-trigger" {...mergeProps(triggerProps, props)} ref={setRef} />
}

function TooltipPortal({ ...props }: TooltipPortalProps) {
  return <PortalPrimitive {...props} />
}

function TooltipContext({ ...props }: TooltipContextProps) {
  return <TooltipPrimitive.Context {...props} />
}

function TooltipPositioner({ className, ...props }: TooltipPositionerProps) {
  return (
    <TooltipPrimitive.Positioner
      data-slot="tooltip-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      className={cn("z-50 [--arrow-background:var(--color-foreground)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <TooltipPrimitive.ArrowTip data-slot="tooltip-arrow-tip" className="rounded-xs" />
        </>
      )}
    </TooltipPrimitive.Arrow>
  )
}

function TooltipContent({ className, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPortal>
      <TooltipPositioner>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          className={cn(
            "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
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
              {children}
              <TooltipArrow />
            </>
          )}
        </TooltipPrimitive.Content>
      </TooltipPositioner>
    </TooltipPortal>
  )
}

function TooltipRootProvider(props: TooltipRootProviderProps) {
  return <TooltipPrimitive.RootProvider {...props} />
}

function TooltipArrowTip({ className, ...props }: TooltipArrowTipProps) {
  return <TooltipPrimitive.ArrowTip data-slot="tooltip-arrow-tip" className={cn(className)} {...props} />
}

type TooltipArrowTipProps = React.ComponentProps<typeof TooltipPrimitive.ArrowTip>

type TooltipRootProps = React.ComponentProps<typeof TooltipPrimitive.Root>

type TooltipRootProviderProps = React.ComponentProps<typeof TooltipPrimitive.RootProvider>

type TooltipArrowProps = React.ComponentProps<typeof TooltipPrimitive.Arrow>

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content>

type TooltipContextProps = React.ComponentProps<typeof TooltipPrimitive.Context>

type TooltipPortalProps = React.ComponentProps<typeof PortalPrimitive>

type TooltipPositionerProps = React.ComponentProps<typeof TooltipPrimitive.Positioner>

type TooltipTriggerProps = React.ComponentProps<typeof TooltipPrimitive.Trigger>

const Tooltip = {
  ArrowTip: TooltipArrowTip,
  Root: TooltipRoot,
  RootProvider: TooltipRootProvider,
  Arrow: TooltipArrow,
  Content: TooltipContent,
  Context: TooltipContext,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
}

export {
  useTooltip,
  useTooltipContext,
  Tooltip,
  type TooltipArrowTipProps,
  type TooltipRootProps,
  type TooltipRootProviderProps,
  type TooltipArrowProps,
  type TooltipContentProps,
  type TooltipContextProps,
  type TooltipPortalProps,
  type TooltipPositionerProps,
  type TooltipProviderProps,
  type TooltipTriggerProps,
}
