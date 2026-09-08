"use client"

import { useToggleGroup, useToggleGroupContext } from "@ark-ui/react"
import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ToggleGroup as ToggleGroupPrimitive } from "@ark-ui/react"

import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupVariantContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    /** Gap between items; 0 joins them into one control. */
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  /** Gap between items; 0 joins them into one control. */
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroupRoot({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupRootProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
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
          <ToggleGroupVariantContext.Provider value={{ variant, size, spacing, orientation }}>
            {children}
          </ToggleGroupVariantContext.Provider>
        </>
      )}
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupContext({ ...props }: ToggleGroupContextProps) {
  return <ToggleGroupPrimitive.Context {...props} />
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupVariantContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

function ToggleGroupRootProvider({ className, ...props }: ToggleGroupRootProviderProps) {
  return (
    <ToggleGroupPrimitive.RootProvider
      data-slot="toggle-group"
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-lg data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    />
  )
}

type ToggleGroupRootProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** Gap between items; 0 joins them into one control. */
    spacing?: number
  }

type ToggleGroupRootProviderProps = React.ComponentProps<typeof ToggleGroupPrimitive.RootProvider>

type ToggleGroupContextProps = React.ComponentProps<typeof ToggleGroupPrimitive.Context>

type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>

const ToggleGroup = {
  Root: ToggleGroupRoot,
  RootProvider: ToggleGroupRootProvider,
  Context: ToggleGroupContext,
  Item: ToggleGroupItem,
}

export {
  useToggleGroup,
  useToggleGroupContext,
  ToggleGroup,
  type ToggleGroupRootProps,
  type ToggleGroupRootProviderProps,
  type ToggleGroupContextProps,
  type ToggleGroupItemProps,
}
