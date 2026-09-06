"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { RatingGroup as RatingGroupPrimitive } from "@ark-ui/react"
import { StarIcon, StarHalfIcon } from "lucide-react"

function RatingGroup({ className, children, ...props }: React.ComponentProps<typeof RatingGroupPrimitive.Root>) {
  return (
    <RatingGroupPrimitive.Root data-slot="rating-group" className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children ?? (
        <RatingGroupControl>
          <RatingGroupContext>
            {({ items }) => items.map((index) => <RatingGroupItem key={index} index={index} />)}
          </RatingGroupContext>
          <RatingGroupHiddenInput />
        </RatingGroupControl>
      )}
    </RatingGroupPrimitive.Root>
  )
}

function RatingGroupContext({ ...props }: React.ComponentProps<typeof RatingGroupPrimitive.Context>) {
  return <RatingGroupPrimitive.Context {...props} />
}

function RatingGroupLabel({ className, ...props }: React.ComponentProps<typeof RatingGroupPrimitive.Label>) {
  return (
    <RatingGroupPrimitive.Label
      data-slot="rating-group-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function RatingGroupControl({ className, ...props }: React.ComponentProps<typeof RatingGroupPrimitive.Control>) {
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

function RatingGroupItem({ className, children, ...props }: React.ComponentProps<typeof RatingGroupPrimitive.Item>) {
  return (
    <RatingGroupPrimitive.Item
      data-slot="rating-group-item"
      className={cn(
        "group/rating-group-item inline-flex cursor-pointer text-muted-foreground/40 transition-colors data-highlighted:text-primary data-readonly:cursor-default data-disabled:cursor-not-allowed [&_svg]:size-5",
        className
      )}
      {...props}
    >
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
    </RatingGroupPrimitive.Item>
  )
}

function RatingGroupItemContext({ ...props }: React.ComponentProps<typeof RatingGroupPrimitive.ItemContext>) {
  return <RatingGroupPrimitive.ItemContext {...props} />
}

function RatingGroupHiddenInput({ ...props }: React.ComponentProps<typeof RatingGroupPrimitive.HiddenInput>) {
  return <RatingGroupPrimitive.HiddenInput {...props} />
}

export {
  RatingGroup,
  RatingGroupContext,
  RatingGroupControl,
  RatingGroupHiddenInput,
  RatingGroupItem,
  RatingGroupItemContext,
  RatingGroupLabel,
}
