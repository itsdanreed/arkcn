"use client"
import * as React from "react"
import { DatePicker as DatePickerPrimitive, useDatePicker, useDatePickerContext, parseDate } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function DatePickerClearTrigger({ className, ...props }: DatePickerClearTriggerProps) {
  return (
    <DatePickerPrimitive.ClearTrigger
      data-slot="date-picker-clear-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerContent({ className, ...props }: DatePickerContentProps) {
  return (
    <DatePickerPrimitive.Content
      data-slot="date-picker-content"
      className={cn(
        "w-fit min-w-64 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none",
        className
      )}
      {...props}
    />
  )
}

function DatePickerContext(props: DatePickerContextProps) {
  return <DatePickerPrimitive.Context {...props} />
}

function DatePickerControl({ className, ...props }: DatePickerControlProps) {
  return (
    <DatePickerPrimitive.Control
      data-slot="date-picker-control"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function DatePickerInput({ className, ...props }: DatePickerInputProps) {
  return (
    <DatePickerPrimitive.Input
      data-slot="date-picker-input"
      className={cn(
        "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerLabel({ className, ...props }: DatePickerLabelProps) {
  return (
    <DatePickerPrimitive.Label
      data-slot="date-picker-label"
      className={cn("text-sm font-medium data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

function DatePickerMonthSelect({ className, ...props }: DatePickerMonthSelectProps) {
  return (
    <DatePickerPrimitive.MonthSelect
      data-slot="date-picker-month-select"
      className={cn(
        "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerNextTrigger({ className, ...props }: DatePickerNextTriggerProps) {
  return (
    <DatePickerPrimitive.NextTrigger
      data-slot="date-picker-next-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerPositioner({ className, ...props }: DatePickerPositionerProps) {
  return (
    <DatePickerPrimitive.Positioner data-slot="date-picker-positioner" className={cn("z-50", className)} {...props} />
  )
}

function DatePickerPresetTrigger({ className, ...props }: DatePickerPresetTriggerProps) {
  return (
    <DatePickerPrimitive.PresetTrigger
      data-slot="date-picker-preset-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerPrevTrigger({ className, ...props }: DatePickerPrevTriggerProps) {
  return (
    <DatePickerPrimitive.PrevTrigger
      data-slot="date-picker-prev-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerRangeText({ className, ...props }: DatePickerRangeTextProps) {
  return (
    <DatePickerPrimitive.RangeText
      data-slot="date-picker-range-text"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function DatePickerValueText({ className, ...props }: DatePickerValueTextProps) {
  return (
    <DatePickerPrimitive.ValueText data-slot="date-picker-value-text" className={cn("text-sm", className)} {...props} />
  )
}

function DatePickerRoot({ className, ...props }: DatePickerRootProps) {
  return (
    <DatePickerPrimitive.Root data-slot="date-picker" className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
}

function DatePickerRootProvider({ className, ...props }: DatePickerRootProviderProps) {
  return (
    <DatePickerPrimitive.RootProvider
      data-slot="date-picker-root-provider"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function DatePickerTable({ className, ...props }: DatePickerTableProps) {
  return (
    <DatePickerPrimitive.Table
      data-slot="date-picker-table"
      className={cn("w-full border-collapse text-sm", className)}
      {...props}
    />
  )
}

function DatePickerTableBody({ className, ...props }: DatePickerTableBodyProps) {
  return <DatePickerPrimitive.TableBody data-slot="date-picker-table-body" className={cn(className)} {...props} />
}

function DatePickerTableCell({ className, ...props }: DatePickerTableCellProps) {
  return (
    <DatePickerPrimitive.TableCell
      data-slot="date-picker-table-cell"
      className={cn("p-0.5 text-center", className)}
      {...props}
    />
  )
}

function DatePickerTableCellTrigger({ className, ...props }: DatePickerTableCellTriggerProps) {
  return (
    <DatePickerPrimitive.TableCellTrigger
      data-slot="date-picker-table-cell-trigger"
      className={cn(
        "flex min-h-8 min-w-8 cursor-default items-center justify-center rounded-md px-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-outside-range:opacity-40 data-today:font-bold data-selected:bg-primary data-selected:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

function DatePickerTableHead({ className, ...props }: DatePickerTableHeadProps) {
  return <DatePickerPrimitive.TableHead data-slot="date-picker-table-head" className={cn(className)} {...props} />
}

function DatePickerTableHeader({ className, ...props }: DatePickerTableHeaderProps) {
  return (
    <DatePickerPrimitive.TableHeader
      data-slot="date-picker-table-header"
      className={cn("h-8 text-center text-xs font-normal text-muted-foreground", className)}
      {...props}
    />
  )
}

function DatePickerWeekNumberHeaderCell({ className, ...props }: DatePickerWeekNumberHeaderCellProps) {
  return (
    <DatePickerPrimitive.WeekNumberHeaderCell
      data-slot="date-picker-week-number-header-cell"
      className={cn("px-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function DatePickerWeekNumberCell({ className, ...props }: DatePickerWeekNumberCellProps) {
  return (
    <DatePickerPrimitive.WeekNumberCell
      data-slot="date-picker-week-number-cell"
      className={cn("px-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function DatePickerTableRow({ className, ...props }: DatePickerTableRowProps) {
  return <DatePickerPrimitive.TableRow data-slot="date-picker-table-row" className={cn(className)} {...props} />
}

function DatePickerTrigger({ className, ...props }: DatePickerTriggerProps) {
  return (
    <DatePickerPrimitive.Trigger
      data-slot="date-picker-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-input px-2.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerView({ className, ...props }: DatePickerViewProps) {
  return (
    <DatePickerPrimitive.View
      data-slot="date-picker-view"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DatePickerViewControl({ className, ...props }: DatePickerViewControlProps) {
  return (
    <DatePickerPrimitive.ViewControl
      data-slot="date-picker-view-control"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function DatePickerViewTrigger({ className, ...props }: DatePickerViewTriggerProps) {
  return (
    <DatePickerPrimitive.ViewTrigger
      data-slot="date-picker-view-trigger"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function DatePickerYearSelect({ className, ...props }: DatePickerYearSelectProps) {
  return (
    <DatePickerPrimitive.YearSelect
      data-slot="date-picker-year-select"
      className={cn(
        "h-8 min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

type DatePickerRootProps = React.ComponentProps<typeof DatePickerPrimitive.Root>

type DatePickerClearTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.ClearTrigger>

type DatePickerContentProps = React.ComponentProps<typeof DatePickerPrimitive.Content>

type DatePickerContextProps = React.ComponentProps<typeof DatePickerPrimitive.Context>

type DatePickerControlProps = React.ComponentProps<typeof DatePickerPrimitive.Control>

type DatePickerInputProps = React.ComponentProps<typeof DatePickerPrimitive.Input>

type DatePickerLabelProps = React.ComponentProps<typeof DatePickerPrimitive.Label>

type DatePickerMonthSelectProps = React.ComponentProps<typeof DatePickerPrimitive.MonthSelect>

type DatePickerNextTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.NextTrigger>

type DatePickerPositionerProps = React.ComponentProps<typeof DatePickerPrimitive.Positioner>

type DatePickerPresetTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.PresetTrigger>

type DatePickerPrevTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.PrevTrigger>

type DatePickerRangeTextProps = React.ComponentProps<typeof DatePickerPrimitive.RangeText>

type DatePickerValueTextProps = React.ComponentProps<typeof DatePickerPrimitive.ValueText>

type DatePickerRootProviderProps = React.ComponentProps<typeof DatePickerPrimitive.RootProvider>

type DatePickerTableProps = React.ComponentProps<typeof DatePickerPrimitive.Table>

type DatePickerTableBodyProps = React.ComponentProps<typeof DatePickerPrimitive.TableBody>

type DatePickerTableCellProps = React.ComponentProps<typeof DatePickerPrimitive.TableCell>

type DatePickerTableCellTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.TableCellTrigger>

type DatePickerTableHeadProps = React.ComponentProps<typeof DatePickerPrimitive.TableHead>

type DatePickerTableHeaderProps = React.ComponentProps<typeof DatePickerPrimitive.TableHeader>

type DatePickerWeekNumberHeaderCellProps = React.ComponentProps<typeof DatePickerPrimitive.WeekNumberHeaderCell>

type DatePickerWeekNumberCellProps = React.ComponentProps<typeof DatePickerPrimitive.WeekNumberCell>

type DatePickerTableRowProps = React.ComponentProps<typeof DatePickerPrimitive.TableRow>

type DatePickerTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.Trigger>

type DatePickerViewProps = React.ComponentProps<typeof DatePickerPrimitive.View>

type DatePickerViewControlProps = React.ComponentProps<typeof DatePickerPrimitive.ViewControl>

type DatePickerViewTriggerProps = React.ComponentProps<typeof DatePickerPrimitive.ViewTrigger>

type DatePickerYearSelectProps = React.ComponentProps<typeof DatePickerPrimitive.YearSelect>

const DatePicker = {
  Root: DatePickerRoot,
  ClearTrigger: DatePickerClearTrigger,
  Content: DatePickerContent,
  Context: DatePickerContext,
  Control: DatePickerControl,
  Input: DatePickerInput,
  Label: DatePickerLabel,
  MonthSelect: DatePickerMonthSelect,
  NextTrigger: DatePickerNextTrigger,
  Positioner: DatePickerPositioner,
  PresetTrigger: DatePickerPresetTrigger,
  PrevTrigger: DatePickerPrevTrigger,
  RangeText: DatePickerRangeText,
  ValueText: DatePickerValueText,
  RootProvider: DatePickerRootProvider,
  Table: DatePickerTable,
  TableBody: DatePickerTableBody,
  TableCell: DatePickerTableCell,
  TableCellTrigger: DatePickerTableCellTrigger,
  TableHead: DatePickerTableHead,
  TableHeader: DatePickerTableHeader,
  WeekNumberHeaderCell: DatePickerWeekNumberHeaderCell,
  WeekNumberCell: DatePickerWeekNumberCell,
  TableRow: DatePickerTableRow,
  Trigger: DatePickerTrigger,
  View: DatePickerView,
  ViewControl: DatePickerViewControl,
  ViewTrigger: DatePickerViewTrigger,
  YearSelect: DatePickerYearSelect,
}

export {
  DatePicker,
  useDatePicker,
  useDatePickerContext,
  parseDate,
  type DatePickerRootProps,
  type DatePickerClearTriggerProps,
  type DatePickerContentProps,
  type DatePickerContextProps,
  type DatePickerControlProps,
  type DatePickerInputProps,
  type DatePickerLabelProps,
  type DatePickerMonthSelectProps,
  type DatePickerNextTriggerProps,
  type DatePickerPositionerProps,
  type DatePickerPresetTriggerProps,
  type DatePickerPrevTriggerProps,
  type DatePickerRangeTextProps,
  type DatePickerValueTextProps,
  type DatePickerRootProviderProps,
  type DatePickerTableProps,
  type DatePickerTableBodyProps,
  type DatePickerTableCellProps,
  type DatePickerTableCellTriggerProps,
  type DatePickerTableHeadProps,
  type DatePickerTableHeaderProps,
  type DatePickerWeekNumberHeaderCellProps,
  type DatePickerWeekNumberCellProps,
  type DatePickerTableRowProps,
  type DatePickerTriggerProps,
  type DatePickerViewProps,
  type DatePickerViewControlProps,
  type DatePickerViewTriggerProps,
  type DatePickerYearSelectProps,
}
