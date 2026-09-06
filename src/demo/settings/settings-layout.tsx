import * as React from "react"
import { createListCollection } from "@ark-ui/react/collection"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectControl, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"

/**
 * Settings — a compositional, router-agnostic settings layout for the demo
 * (page heading, section nav, scrolling sections): page heading, a section nav that is a vertical list on
 * large screens, a horizontal scroller on medium ones and a Select on small
 * ones, and a scrollable content section with its own heading.
 *
 * `Settings` owns only the selected section (`value`/`onValueChange`); routing,
 * forms and data are the consumer's. Nav links are plain anchors via `asChild`.
 */

type SettingsContextValue = {
  value: string
  setValue: (value: string) => void
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null)

function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within <Settings>")
  return ctx
}

function Settings({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Identifier of the active section (usually its href). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const ctx = React.useMemo(() => ({ value, setValue }), [value, setValue])
  return (
    <SettingsContext.Provider value={ctx}>
      <div data-slot="settings" className={cn("flex min-h-0 flex-1 flex-col", className)} {...props} />
    </SettingsContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page heading                                                              */
/* -------------------------------------------------------------------------- */

function SettingsHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="settings-header" className={cn("space-y-0.5", className)} {...props} />
}

function SettingsTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="settings-title"
      className={cn("text-2xl font-bold tracking-tight md:text-3xl", className)}
      {...props}
    />
  )
}

function SettingsDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="settings-description" className={cn("text-muted-foreground", className)} {...props} />
}

function SettingsSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="settings-separator" className={cn("my-4 lg:my-6", className)} {...props} />
}

/* -------------------------------------------------------------------------- */
/*  Body: nav + content                                                       */
/* -------------------------------------------------------------------------- */

function SettingsBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:flex-row lg:gap-12", className)}
      {...props}
    />
  )
}

function SettingsNav({ className, ...props }: React.ComponentProps<"aside">) {
  return <aside data-slot="settings-nav" className={cn("top-0 shrink-0 lg:sticky lg:w-1/5", className)} {...props} />
}

type SettingsNavOption = { value: string; label: React.ReactNode; icon?: React.ReactNode }

/** Small-screen nav: a Select over the sections. Hidden from `md` up. */
function SettingsNavSelect({
  options,
  className,
  placeholder = "Select a section",
  ...props
}: Omit<React.ComponentProps<typeof Select<SettingsNavOption>>, "collection" | "value" | "onValueChange"> & {
  options: SettingsNavOption[]
  className?: string
  placeholder?: string
}) {
  const { value, setValue } = useSettings()
  const collection = React.useMemo(
    () => createListCollection({ items: options, itemToValue: (o) => o.value }),
    [options]
  )
  const selected = options.find((o) => o.value === value)
  return (
    <div data-slot="settings-nav-select" className={cn("p-1 md:hidden", className)}>
      <Select
        collection={collection}
        value={[value]}
        onValueChange={({ value }) => value[0] !== undefined && setValue(value[0])}
        {...props}
      >
        <SelectControl>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder={placeholder}>
              {selected && (
                <span className="flex items-center gap-x-4 px-2 py-1">
                  {selected.icon && <span className="scale-125 [&_svg]:size-4">{selected.icon}</span>}
                  <span className="text-base">{selected.label}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
        </SelectControl>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} item={option}>
              <span className="flex items-center gap-x-4 px-2 py-1">
                {option.icon && <span className="scale-125 [&_svg]:size-4">{option.icon}</span>}
                <span className="text-base">{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Medium+ nav: horizontal scroller that becomes a vertical list on `lg`. */
function SettingsNavList({ className, children, ...props }: React.ComponentProps<"nav">) {
  return (
    <ScrollArea data-slot="settings-nav-scroll" className="hidden w-full min-w-40 bg-background px-1 py-2 md:block">
      <nav data-slot="settings-nav-list" className={cn("flex gap-2 py-1 lg:flex-col lg:gap-1", className)} {...props}>
        {children}
      </nav>
    </ScrollArea>
  )
}

/**
 * A section link. Renders its child anchor via `asChild` (default) so any
 * router works; `value` marks it active when it matches the shell value and
 * clicking it updates the value.
 */
function SettingsNavLink({
  value,
  active,
  asChild = true,
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"a"> & {
  value: string
  active?: boolean
  asChild?: boolean
}) {
  const ctx = useSettings()
  const isActive = active ?? ctx.value === value
  const linkProps = {
    "data-slot": "settings-nav-link",
    "data-active": isActive ? "true" : undefined,
    "aria-current": isActive ? ("page" as const) : undefined,
    className: cn(
      buttonVariants({ variant: "ghost" }),
      "justify-start",
      isActive ? "bg-muted hover:bg-accent" : "hover:bg-accent hover:underline",
      className
    ),
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) ctx.setValue(value)
    },
    ...props,
  }
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    return React.cloneElement(child, {
      ...linkProps,
      className: cn(linkProps.className, child.props.className as string | undefined),
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        ;(child.props.onClick as ((e: React.MouseEvent<HTMLAnchorElement>) => void) | undefined)?.(event)
        linkProps.onClick(event)
      },
    })
  }
  return <a {...linkProps}>{children}</a>
}

function SettingsNavIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="settings-nav-icon"
      className={cn("me-2 flex items-center [&_svg]:size-4.5", className)}
      {...props}
    />
  )
}

function SettingsContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-content"
      className={cn("flex min-h-0 w-full flex-1 overflow-y-hidden p-1", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

function SettingsSection({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="settings-section" className={cn("flex min-h-0 flex-1 flex-col", className)} {...props} />
}

function SettingsSectionHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="settings-section-header" className={cn("flex-none", className)} {...props} />
}

function SettingsSectionTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="settings-section-title" className={cn("text-lg font-medium", className)} {...props} />
}

function SettingsSectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="settings-section-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function SettingsSectionSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="settings-section-separator" className={cn("my-4 flex-none", className)} {...props} />
}

/** The scrolling area of a section. */
function SettingsSectionBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="settings-section-body"
      className={cn("no-scrollbar size-full min-h-0 scroll-fade-b overflow-y-auto scroll-smooth pe-4 pb-12", className)}
      {...props}
    />
  )
}

/** Width-constrained wrapper for the section's form or content. */
function SettingsSectionContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="settings-section-content" className={cn("-mx-1 px-1.5 lg:max-w-xl", className)} {...props} />
}

export {
  Settings,
  SettingsBody,
  SettingsContent,
  SettingsDescription,
  SettingsHeader,
  SettingsNav,
  SettingsNavIcon,
  SettingsNavLink,
  SettingsNavList,
  SettingsNavSelect,
  SettingsSection,
  SettingsSectionBody,
  SettingsSectionContent,
  SettingsSectionDescription,
  SettingsSectionHeader,
  SettingsSectionSeparator,
  SettingsSectionTitle,
  SettingsSeparator,
  SettingsTitle,
  useSettings,
  type SettingsNavOption,
}
