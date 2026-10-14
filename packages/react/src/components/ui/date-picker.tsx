"use client"
import * as React from "react"
import { DatePicker as DatePickerPrimitive, useDatePicker, useDatePickerContext, parseDate } from "@ark-ui/react"
import { cn } from "../../lib/utils"
import { InputGroup } from "./input-group"
import { buttonVariants } from "./button"
import { CalendarIcon, XIcon } from "lucide-react"

function DatePickerClearTrigger({ className, children, ...props }: DatePickerClearTriggerProps) {
  const api = useDatePickerContext()
  return (
    // Hidden with its addon while there's no value, so no empty padding is left behind.
    <InputGroup.Addon align="inline-end" className="has-[>[hidden]]:hidden">
      <DatePickerPrimitive.ClearTrigger
        data-slot="date-picker-clear-trigger"
        asChild
        disabled={api.disabled || api.readOnly}
        {...props}
      >
        <InputGroup.Trigger size="icon-xs" className={className}>
          {children ?? <XIcon />}
        </InputGroup.Trigger>
      </DatePickerPrimitive.ClearTrigger>
    </InputGroup.Addon>
  )
}

function DatePickerContent({ className, ...props }: DatePickerContentProps) {
  return (
    <DatePickerPrimitive.Content
      data-slot="date-picker-content"
      className={cn(
        "z-50 w-fit min-w-53 origin-(--transform-origin) rounded-lg bg-popover p-2 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition-none duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function DatePickerContext(props: DatePickerContextProps) {
  return <DatePickerPrimitive.Context {...props} />
}

/** The input and its triggers as one bordered field (an `InputGroup`); triggers sit inside, at the end. */
function DatePickerControl({ className, children, ...props }: DatePickerControlProps) {
  return (
    <DatePickerPrimitive.Control asChild {...props}>
      <InputGroup.Root className={className}>{children}</InputGroup.Root>
    </DatePickerPrimitive.Control>
  )
}

function DatePickerInput({ className, ...props }: DatePickerInputProps) {
  return (
    <DatePickerPrimitive.Input asChild {...props}>
      <InputGroup.Input className={className} />
    </DatePickerPrimitive.Input>
  )
}

function DatePickerLabel({ className, ...props }: DatePickerLabelProps) {
  return (
    <DatePickerPrimitive.Label
      data-slot="date-picker-label"
      className={cn("text-sm/none font-medium select-none", className)}
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
      className={cn(buttonVariants({ variant: "ghost" }), "absolute right-0 size-7 p-0 select-none", className)}
      {...props}
    />
  )
}

function DatePickerPositioner({ className, ...props }: DatePickerPositionerProps) {
  return (
    <DatePickerPrimitive.Positioner
      data-slot="date-picker-positioner"
      // zag positions with an inline `z-index: var(--z-index)`, so a z-index class alone has no effect.
      className={cn("[--z-index:50]", className)}
      {...props}
    />
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
      className={cn(buttonVariants({ variant: "ghost" }), "absolute left-0 size-7 p-0 select-none", className)}
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

/**
 * The date picker. Its calendar mounts when opened (like Popover and Select), so it stacks above
 * a dialog it's inside instead of beneath it.
 */
function DatePickerRoot({ className, lazyMount = true, unmountOnExit = true, ...props }: DatePickerRootProps) {
  return (
    <DatePickerPrimitive.Root
      data-slot="date-picker"
      className={cn("flex flex-col gap-1.5", className)}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      {...props}
    />
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

function DatePickerTable({ className, columns, style, ...props }: DatePickerTableProps) {
  return (
    <DatePickerPrimitive.Table
      data-slot="date-picker-table"
      className={cn(
        "w-full border-collapse text-sm [--date-picker-columns:4] data-[view=day]:[--date-picker-columns:7]",
        className
      )}
      columns={columns}
      style={{ "--date-picker-columns": columns, ...style } as React.CSSProperties}
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
      className={cn(
        "relative size-full rounded-md p-0 text-center select-none in-data-[view=day]:aspect-square has-data-in-range:rounded-none has-data-in-range:bg-accent has-data-outside-range:text-muted-foreground has-data-range-end:rounded-e-lg has-data-range-start:rounded-s-lg has-data-today:bg-muted has-data-today:text-foreground has-data-disabled:text-muted-foreground has-data-disabled:opacity-50 has-[[data-today][data-selected]]:rounded-none",
        className
      )}
      {...props}
    />
  )
}

function DatePickerTableCellTrigger({ className, ...props }: DatePickerTableCellTriggerProps) {
  return (
    <DatePickerPrimitive.TableCellTrigger
      data-slot="date-picker-table-cell-trigger"
      className={cn(
        "relative isolate z-10 flex h-8 w-full min-w-7 cursor-default items-center justify-center rounded-lg border-0 border-transparent bg-clip-padding p-0 text-sm/none font-normal whitespace-nowrap transition-all outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px data-in-range:not-data-selected:rounded-none data-in-range:not-data-selected:bg-accent data-in-range:not-data-selected:text-accent-foreground data-[view=day]:aspect-square data-[view=day]:h-auto dark:hover:bg-muted/50 dark:hover:text-foreground data-selected:bg-primary data-selected:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
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
      className={cn(
        "flex-1 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground select-none",
        className
      )}
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
  return (
    <DatePickerPrimitive.TableRow
      data-slot="date-picker-table-row"
      className={cn(
        "grid w-full grid-cols-[repeat(var(--date-picker-columns),minmax(0,1fr))] in-[tbody]:mt-2",
        className
      )}
      {...props}
    />
  )
}

function DatePickerTrigger({ className, children, ...props }: DatePickerTriggerProps) {
  return (
    <InputGroup.Addon align="inline-end">
      <DatePickerPrimitive.Trigger data-slot="date-picker-trigger" asChild {...props}>
        <InputGroup.Trigger size="icon-xs" className={className}>
          {children ?? <CalendarIcon />}
        </InputGroup.Trigger>
      </DatePickerPrimitive.Trigger>
    </InputGroup.Addon>
  )
}

function DatePickerView({ className, ...props }: DatePickerViewProps) {
  return (
    <DatePickerPrimitive.View
      data-slot="date-picker-view"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

function DatePickerViewControl({ className, ...props }: DatePickerViewControlProps) {
  return (
    <DatePickerPrimitive.ViewControl
      data-slot="date-picker-view-control"
      className={cn("relative flex h-7 items-center justify-center px-7", className)}
      {...props}
    />
  )
}

function DatePickerViewTrigger({ className, ...props }: DatePickerViewTriggerProps) {
  return (
    <DatePickerPrimitive.ViewTrigger
      data-slot="date-picker-view-trigger"
      className={cn(buttonVariants({ variant: "ghost" }), "h-7 border-0 p-0", className)}
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
