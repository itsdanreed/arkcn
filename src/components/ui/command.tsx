import * as React from "react"
import {
  Listbox as CommandPrimitive,
  createListCollection,
  useFilter,
  useListCollection,
  type CollectionItem,
  type ListCollection,
} from "@ark-ui/react"
import { cn } from "@/lib/utils"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"

/**
 * Backed by Ark UI's Listbox. Ark has no built-in fuzzy filter: pass a
 * `collection` and filter it yourself (see `useListCollection` and
 * `useFilter`, re-exported below), wiring `CommandInput`'s `onValueChange`
 * to the collection's `filter`.
 */

type SelectHandler = (value: string) => void

const CommandSelectContext = React.createContext<{
  register: (value: string, handler: SelectHandler) => () => void
} | null>(null)

function Command<T extends CollectionItem>({
  className,
  selectionMode = "single",
  onSelect,
  defaultHighlightedValue,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Root<T>>) {
  // Like cmdk, highlight the first item on mount so Enter works immediately.
  const initialHighlight = defaultHighlightedValue ?? props.collection.firstValue
  const handlers = React.useRef(new Map<string, SelectHandler>())
  const register = React.useCallback((value: string, handler: SelectHandler) => {
    handlers.current.set(value, handler)
    return () => {
      handlers.current.delete(value)
    }
  }, [])
  const ctx = React.useMemo(() => ({ register }), [register])
  return (
    <CommandSelectContext.Provider value={ctx}>
      <CommandPrimitive.Root
        data-slot="command"
        selectionMode={selectionMode}
        defaultHighlightedValue={initialHighlight}
        onSelect={(details) => {
          handlers.current.get(details.value)?.(details.value)
          onSelect?.(details)
        }}
        className={cn(
          "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
          className
        )}
        {...props}
      />
    </CommandSelectContext.Provider>
  )
}

function CommandContext({ ...props }: React.ComponentProps<typeof CommandPrimitive.Context>) {
  return <CommandPrimitive.Context {...props} />
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogContent className={cn("overflow-hidden rounded-xl! p-0", className)} showCloseButton={showCloseButton}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  autoHighlight = true,
  onValueChange,
  onChange,
  onFocus,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  /** Called with the input text on every change. Wire it to your collection's `filter`. */
  onValueChange?: (value: string) => void
}) {
  const settled = React.useRef(false)
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          autoHighlight={autoHighlight}
          onFocus={(event) => {
            onFocus?.(event)
            // When a Dialog focuses this input in the same tick it mounts, the
            // listbox machine has not entered its ready state yet and drops the
            // focus event, leaving the highlighted item invisible. Re-issue the
            // focus once, on the next tick, so the listbox registers it.
            if (settled.current) return
            settled.current = true
            const el = event.currentTarget
            setTimeout(() => {
              if (document.activeElement !== el) return
              el.blur()
              el.focus({ preventScroll: true })
            }, 0)
          }}
          className={cn("w-full text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className)}
          onChange={(event) => {
            onChange?.(event)
            onValueChange?.(event.currentTarget.value)
          }}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Content>) {
  return (
    <CommandPrimitive.Content
      data-slot="command-list"
      className={cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.ItemGroup> & {
  /** Group heading text. */
  heading?: React.ReactNode
}) {
  return (
    <CommandPrimitive.ItemGroup
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {heading != null && <CommandGroupLabel>{heading}</CommandGroupLabel>}
      {children}
    </CommandPrimitive.ItemGroup>
  )
}

function CommandGroupLabel({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.ItemGroupLabel>) {
  return (
    <CommandPrimitive.ItemGroupLabel
      data-slot="command-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  item,
  value,
  onSelect,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.Item>, "item" | "onSelect"> & {
  /** The collection item. Falls back to `value` for string collections. */
  item?: CollectionItem
  value?: string
  /** Called with the item's value when it is selected by click or Enter. */
  onSelect?: SelectHandler
}) {
  const ctx = React.useContext(CommandSelectContext)
  const resolvedItem = item ?? value
  const itemValue =
    typeof resolvedItem === "string" ? resolvedItem : ((resolvedItem as { value?: string } | undefined)?.value ?? value)
  React.useEffect(() => {
    if (!ctx || !onSelect || itemValue == null) return
    return ctx.register(itemValue, onSelect)
  }, [ctx, onSelect, itemValue])
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      item={resolvedItem}
      className={cn(
        "group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CommandItemIndicator>
        <CheckIcon />
      </CommandItemIndicator>
    </CommandPrimitive.Item>
  )
}

function CommandItemText({ ...props }: React.ComponentProps<typeof CommandPrimitive.ItemText>) {
  return <CommandPrimitive.ItemText data-slot="command-item-text" {...props} />
}

function CommandItemIndicator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.ItemIndicator>) {
  return (
    <CommandPrimitive.ItemIndicator
      data-slot="command-item-indicator"
      className={cn("ml-auto group-has-data-[slot=command-shortcut]/command-item:hidden", className)}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandContext,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandItemIndicator,
  CommandItemText,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  createListCollection,
  useFilter,
  useListCollection,
  type CollectionItem,
  type ListCollection,
}
