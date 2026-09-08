"use client"

import { useRatingGroup, useRatingGroupContext, useRatingGroupItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { RatingGroup as RatingGroupPrimitive } from "@ark-ui/react"
import { StarIcon, StarHalfIcon } from "lucide-react"

function RatingGroupRoot({ className, children, ...props }: RatingGroupRootProps) {
  return (
    <RatingGroupPrimitive.Root data-slot="rating-group" className={cn("flex flex-col gap-1.5", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <RatingGroupControl>
              <RatingGroupContext>
                {({ items }) => items.map((index) => <RatingGroupItem key={index} index={index} />)}
              </RatingGroupContext>
              <RatingGroupHiddenInput />
            </RatingGroupControl>
          )}
        </>
      )}
    </RatingGroupPrimitive.Root>
  )
}

function RatingGroupContext({ ...props }: RatingGroupContextProps) {
  return <RatingGroupPrimitive.Context {...props} />
}

function RatingGroupLabel({ className, ...props }: RatingGroupLabelProps) {
  return (
    <RatingGroupPrimitive.Label
      data-slot="rating-group-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function RatingGroupControl({ className, ...props }: RatingGroupControlProps) {
  return (
    <RatingGroupPrimitive.Control
      data-slot="rating-group-control"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function RatingGroupItem({ className, children, ...props }: RatingGroupItemProps) {
  return (
    <RatingGroupPrimitive.Item
      data-slot="rating-group-item"
      className={cn(
        "group/rating-group-item inline-flex cursor-pointer text-muted-foreground/40 transition-colors data-highlighted:text-primary data-readonly:cursor-default data-disabled:cursor-not-allowed [&_svg]:size-5",
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
          {children ?? (
            <RatingGroupPrimitive.ItemContext>
              {({ half, highlighted }) =>
                half ? (
                  <StarHalfIcon className="fill-current" />
                ) : (
                  <StarIcon className={highlighted ? "fill-current" : undefined} />
                )
              }
            </RatingGroupPrimitive.ItemContext>
          )}
        </>
      )}
    </RatingGroupPrimitive.Item>
  )
}

function RatingGroupItemContext({ ...props }: RatingGroupItemContextProps) {
  return <RatingGroupPrimitive.ItemContext {...props} />
}

function RatingGroupHiddenInput({ ...props }: RatingGroupHiddenInputProps) {
  return <RatingGroupPrimitive.HiddenInput {...props} />
}

function RatingGroupRootProvider({ className, ...props }: RatingGroupRootProviderProps) {
  return (
    <RatingGroupPrimitive.RootProvider
      data-slot="rating-group"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type RatingGroupRootProps = React.ComponentProps<typeof RatingGroupPrimitive.Root>

type RatingGroupRootProviderProps = React.ComponentProps<typeof RatingGroupPrimitive.RootProvider>

type RatingGroupContextProps = React.ComponentProps<typeof RatingGroupPrimitive.Context>

type RatingGroupControlProps = React.ComponentProps<typeof RatingGroupPrimitive.Control>

type RatingGroupHiddenInputProps = React.ComponentProps<typeof RatingGroupPrimitive.HiddenInput>

type RatingGroupItemProps = React.ComponentProps<typeof RatingGroupPrimitive.Item>

type RatingGroupItemContextProps = React.ComponentProps<typeof RatingGroupPrimitive.ItemContext>

type RatingGroupLabelProps = React.ComponentProps<typeof RatingGroupPrimitive.Label>

const RatingGroup = {
  Root: RatingGroupRoot,
  RootProvider: RatingGroupRootProvider,
  Context: RatingGroupContext,
  Control: RatingGroupControl,
  HiddenInput: RatingGroupHiddenInput,
  Item: RatingGroupItem,
  ItemContext: RatingGroupItemContext,
  Label: RatingGroupLabel,
}

export {
  useRatingGroup,
  useRatingGroupContext,
  useRatingGroupItemContext,
  RatingGroup,
  type RatingGroupRootProps,
  type RatingGroupRootProviderProps,
  type RatingGroupContextProps,
  type RatingGroupControlProps,
  type RatingGroupHiddenInputProps,
  type RatingGroupItemProps,
  type RatingGroupItemContextProps,
  type RatingGroupLabelProps,
}
