"use client"

import { useDateInput, useDateInputContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { DateInput as DateInputPrimitive } from "@ark-ui/react"

function DateInputRoot({ className, children, ...props }: DateInputRootProps) {
  return (
    <DateInputPrimitive.Root
      data-slot="date-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <DateInputControl>
              <DateInputSegmentGroup />
              <DateInputHiddenInput />
            </DateInputControl>
          )}
        </>
      )}
    </DateInputPrimitive.Root>
  )
}

function DateInputContext({ ...props }: DateInputContextProps) {
  return <DateInputPrimitive.Context {...props} />
}

function DateInputLabel({ className, ...props }: DateInputLabelProps) {
  return (
    <DateInputPrimitive.Label
      data-slot="date-input-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function DateInputControl({ className, ...props }: DateInputControlProps) {
  return (
    <DateInputPrimitive.Control
      data-slot="date-input-control"
      className={cn(
        "flex h-8 w-fit items-center rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DateInputSegmentGroup({ className, children, index = 0, ...props }: DateInputSegmentGroupProps) {
  return (
    <DateInputPrimitive.SegmentGroup
      data-slot="date-input-segment-group"
      index={index}
      className={cn("flex items-center", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <DateInputPrimitive.Context>
              {(api) => api.getSegments({ index }).map((segment, i) => <DateInputSegment key={i} segment={segment} />)}
            </DateInputPrimitive.Context>
          )}
        </>
      )}
    </DateInputPrimitive.SegmentGroup>
  )
}

function DateInputSegment({ className, ...props }: DateInputSegmentProps) {
  return (
    <DateInputPrimitive.Segment
      data-slot="date-input-segment"
      className={cn(
        "rounded-sm px-0.5 tabular-nums outline-none data-editable:focus:bg-primary data-editable:focus:text-primary-foreground data-placeholder-shown:text-muted-foreground data-[type=literal]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DateInputSegmentContext({ ...props }: DateInputSegmentContextProps) {
  return <DateInputPrimitive.SegmentContext {...props} />
}

function DateInputHiddenInput({ ...props }: DateInputHiddenInputProps) {
  return <DateInputPrimitive.HiddenInput {...props} />
}

function DateInputRootProvider({ className, ...props }: DateInputRootProviderProps) {
  return (
    <DateInputPrimitive.RootProvider
      data-slot="date-input"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type DateInputRootProps = React.ComponentProps<typeof DateInputPrimitive.Root>

type DateInputRootProviderProps = React.ComponentProps<typeof DateInputPrimitive.RootProvider>

type DateInputContextProps = React.ComponentProps<typeof DateInputPrimitive.Context>

type DateInputControlProps = React.ComponentProps<typeof DateInputPrimitive.Control>

type DateInputHiddenInputProps = React.ComponentProps<typeof DateInputPrimitive.HiddenInput>

type DateInputLabelProps = React.ComponentProps<typeof DateInputPrimitive.Label>

type DateInputSegmentProps = React.ComponentProps<typeof DateInputPrimitive.Segment>

type DateInputSegmentContextProps = React.ComponentProps<typeof DateInputPrimitive.SegmentContext>

type DateInputSegmentGroupProps = React.ComponentProps<typeof DateInputPrimitive.SegmentGroup>

const DateInput = {
  Root: DateInputRoot,
  RootProvider: DateInputRootProvider,
  Context: DateInputContext,
  Control: DateInputControl,
  HiddenInput: DateInputHiddenInput,
  Label: DateInputLabel,
  Segment: DateInputSegment,
  SegmentContext: DateInputSegmentContext,
  SegmentGroup: DateInputSegmentGroup,
}

export {
  useDateInput,
  useDateInputContext,
  DateInput,
  type DateInputRootProps,
  type DateInputRootProviderProps,
  type DateInputContextProps,
  type DateInputControlProps,
  type DateInputHiddenInputProps,
  type DateInputLabelProps,
  type DateInputSegmentProps,
  type DateInputSegmentContextProps,
  type DateInputSegmentGroupProps,
}
