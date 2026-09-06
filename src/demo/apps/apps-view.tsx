import * as React from "react"
import { useControllable } from "@/lib/controllable"
import { createListCollection } from "@ark-ui/react/collection"
import { ArrowDownAZIcon, ArrowUpAZIcon, SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectControl, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * Apps — a compositional "app integrations" view for the demo. The root owns only the query state (search text, filter value,
 * sort direction); which items exist and how they are filtered is the consumer's.
 * `applyAppsQuery` is an optional helper for the common case.
 */

type AppsSortDirection = "asc" | "desc"

type AppsContextValue = {
  search: string
  setSearch: (value: string) => void
  filter: string
  setFilter: (value: string) => void
  sort: AppsSortDirection
  setSort: (value: AppsSortDirection) => void
}

const AppsContext = React.createContext<AppsContextValue | null>(null)

function useApps() {
  const ctx = React.useContext(AppsContext)
  if (!ctx) throw new Error("useApps must be used within <Apps>")
  return ctx
}

type AppsProps = React.ComponentProps<"div"> & {
  search?: string
  defaultSearch?: string
  onSearchChange?: (value: string) => void
  filter?: string
  defaultFilter?: string
  onFilterChange?: (value: string) => void
  sort?: AppsSortDirection
  defaultSort?: AppsSortDirection
  onSortChange?: (value: AppsSortDirection) => void
}

function Apps({
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  filter: filterProp,
  defaultFilter = "all",
  onFilterChange,
  sort: sortProp,
  defaultSort = "asc",
  onSortChange,
  className,
  ...props
}: AppsProps) {
  const [search, setSearch] = useControllable(searchProp, defaultSearch, onSearchChange)
  const [filter, setFilter] = useControllable(filterProp, defaultFilter, onFilterChange)
  const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange)
  const ctx = React.useMemo(
    () => ({ search, setSearch, filter, setFilter, sort, setSort }),
    [search, setSearch, filter, setFilter, sort, setSort]
  )
  return (
    <AppsContext.Provider value={ctx}>
      <div data-slot="apps" className={cn("flex min-h-0 flex-1 flex-col", className)} {...props} />
    </AppsContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Heading                                                                   */
/* -------------------------------------------------------------------------- */

function AppsHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="apps-header" className={cn("flex flex-col gap-1", className)} {...props} />
}

function AppsTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return <h1 data-slot="apps-title" className={cn("text-2xl font-bold tracking-tight", className)} {...props} />
}

function AppsDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="apps-description" className={cn("text-muted-foreground", className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                   */
/* -------------------------------------------------------------------------- */

function AppsToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="apps-toolbar"
      className={cn("my-4 flex items-end justify-between gap-4 sm:items-center", className)}
      {...props}
    />
  )
}

function AppsToolbarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="apps-toolbar-group"
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-center", className)}
      {...props}
    />
  )
}

function AppsSearch({ className, onChange, ...props }: React.ComponentProps<typeof Input>) {
  const { search, setSearch } = useApps()
  return (
    <Input
      data-slot="apps-search"
      type="search"
      placeholder="Filter apps..."
      value={search}
      onChange={(event) => {
        onChange?.(event)
        setSearch(event.currentTarget.value)
      }}
      className={cn("h-9 w-40 lg:w-62.5", className)}
      {...props}
    />
  )
}

type AppsOption = { value: string; label: React.ReactNode; icon?: React.ReactNode }

type AppsSelectProps = Omit<
  React.ComponentProps<typeof Select<AppsOption>>,
  "collection" | "value" | "onValueChange"
> & {
  options: AppsOption[]
  /** Rendered inside the trigger. Defaults to the selected option's label. */
  children?: React.ReactNode
  className?: string
}

/** Select bound to the `filter` value. Supply the options; "all" is the default filter. */
function AppsFilter({ options, children, className, ...props }: AppsSelectProps) {
  const { filter, setFilter } = useApps()
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.value }),
    [options]
  )
  const selected = options.find((o) => o.value === filter)
  return (
    <Select
      data-slot="apps-filter"
      collection={collection}
      value={[filter]}
      onValueChange={({ value }) => value[0] !== undefined && setFilter(value[0])}
      {...props}
    >
      <SelectControl>
        <SelectTrigger className={cn("w-36", className)}>
          <SelectValue>{children ?? selected?.label}</SelectValue>
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} item={option}>
            {option.icon}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const defaultSortOptions: AppsOption[] = [
  { value: "asc", label: "Ascending", icon: <ArrowUpAZIcon /> },
  { value: "desc", label: "Descending", icon: <ArrowDownAZIcon /> },
]

/** Select bound to the `sort` direction. Renders an icon-only trigger by default. */
function AppsSort({
  options = defaultSortOptions,
  children,
  className,
  positioning,
  ...props
}: Partial<AppsSelectProps>) {
  const { sort, setSort } = useApps()
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.value }),
    [options]
  )
  return (
    <Select
      data-slot="apps-sort"
      collection={collection}
      value={[sort]}
      onValueChange={({ value }) => value[0] !== undefined && setSort(value[0] as AppsSortDirection)}
      positioning={{ placement: "bottom-end", sameWidth: false, ...positioning }}
      {...props}
    >
      <SelectControl>
        <SelectTrigger className={cn("w-16", className)} aria-label="Sort">
          <SelectValue>{children ?? <SlidersHorizontalIcon className="size-4.5" />}</SelectValue>
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} item={option} className="gap-4">
            {option.icon}
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function AppsSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="apps-separator" className={cn("shadow-sm", className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Grid + cards                                                              */
/* -------------------------------------------------------------------------- */

function AppsGrid({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="apps-grid"
      className={cn(
        "no-scrollbar grid min-h-0 flex-1 scroll-fade-b content-start gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
      {...props}
    />
  )
}

function AppsEmpty({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="apps-empty"
      className={cn(
        "col-span-full flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function AppCard({ className, connected, ...props }: React.ComponentProps<"li"> & { connected?: boolean }) {
  return (
    <li
      data-slot="app-card"
      data-connected={connected ? "" : undefined}
      className={cn("rounded-lg border bg-card p-4 transition-shadow hover:shadow-md", className)}
      {...props}
    />
  )
}

function AppCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="app-card-header" className={cn("mb-8 flex items-center justify-between", className)} {...props} />
  )
}

function AppCardLogo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="app-card-logo"
      className={cn("flex size-10 items-center justify-center rounded-lg bg-muted p-2 [&_svg]:size-full", className)}
      {...props}
    />
  )
}

/** The connect/connected button. Pass `connected` for the highlighted state. */
function AppCardActionTrigger({
  className,
  connected,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: React.ComponentProps<typeof Button> & { connected?: boolean }) {
  return (
    <Button
      data-slot="app-card-action"
      data-connected={connected ? "" : undefined}
      variant={variant}
      size={size}
      className={cn(
        connected &&
          "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900",
        className
      )}
      {...props}
    >
      {children ?? (connected ? "Connected" : "Connect")}
    </Button>
  )
}

function AppCardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="app-card-body" className={cn("flex flex-col", className)} {...props} />
}

function AppCardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="app-card-title" className={cn("mb-1 font-semibold", className)} {...props} />
}

function AppCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="app-card-description" className={cn("line-clamp-2 text-muted-foreground", className)} {...props} />
  )
}

/* -------------------------------------------------------------------------- */
/*  Helper                                                                    */
/* -------------------------------------------------------------------------- */

type AppsQuery = { search: string; filter: string; sort: AppsSortDirection }

/**
 * Optional convenience: sort by name, then apply the connected filter
 * ("all" | "connected" | "notConnected") and the case-insensitive name search.
 */
function applyAppsQuery<T>(
  items: readonly T[],
  query: AppsQuery,
  accessors: { name: (item: T) => string; connected: (item: T) => boolean }
): T[] {
  const { search, filter, sort } = query
  const term = search.trim().toLowerCase()
  return [...items]
    .sort((a, b) =>
      sort === "asc"
        ? accessors.name(a).localeCompare(accessors.name(b))
        : accessors.name(b).localeCompare(accessors.name(a))
    )
    .filter((item) =>
      filter === "connected" ? accessors.connected(item) : filter === "notConnected" ? !accessors.connected(item) : true
    )
    .filter((item) => accessors.name(item).toLowerCase().includes(term))
}

export {
  AppCard,
  AppCardActionTrigger,
  AppCardBody,
  AppCardDescription,
  AppCardHeader,
  AppCardLogo,
  AppCardTitle,
  Apps,
  AppsDescription,
  AppsEmpty,
  AppsFilter,
  AppsGrid,
  AppsHeader,
  AppsSearch,
  AppsSeparator,
  AppsSort,
  AppsTitle,
  AppsToolbar,
  AppsToolbarGroup,
  applyAppsQuery,
  useApps,
  type AppsOption,
  type AppsQuery,
  type AppsSortDirection,
}
