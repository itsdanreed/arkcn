import { ark } from "@ark-ui/react"
import { useListbox, useListboxContext, useListboxItemContext } from "@ark-ui/react"
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

import { Dialog } from "@/components/ui/dialog"
import { InputGroup } from "@/components/ui/input-group"
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

function CommandRoot<T extends CollectionItem>({
  className,
  selectionMode = "single",
  onSelect,
  defaultHighlightedValue,
  ...props
}: CommandRootProps<T>) {
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

function CommandContext({ ...props }: CommandContextProps) {
  return <CommandPrimitive.Context {...props} />
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Content className={cn("overflow-hidden rounded-xl! p-0", className)} showCloseButton={showCloseButton}>
        <Dialog.Header className="sr-only">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </Dialog.Header>
        {children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

function CommandInput({
  className,
  autoHighlight = true,
  onValueChange,
  onChange,
  onFocus,
  ...props
}: CommandInputProps) {
  const settled = React.useRef(false)
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup.Root className="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!">
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
        <InputGroup.Addon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  )
}

function CommandContent({ className, ...props }: CommandContentProps) {
  return (
    <CommandPrimitive.Content
      data-slot="command-list"
      className={cn("no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  )
}

function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function CommandItemGroup({ className, heading, children, ...props }: CommandItemGroupProps) {
  return (
    <CommandPrimitive.ItemGroup
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {heading != null && <CommandItemGroupLabel>{heading}</CommandItemGroupLabel>}
          {children}
        </>
      )}
    </CommandPrimitive.ItemGroup>
  )
}

function CommandItemGroupLabel({ className, ...props }: CommandItemGroupLabelProps) {
  return (
    <CommandPrimitive.ItemGroupLabel
      data-slot="command-group-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function CommandSeparator({ className, ...props }: CommandSeparatorProps) {
  return (
    <ark.div
      role="separator"
      aria-orientation="horizontal"
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({ className, children, item, value, onSelect, ...props }: CommandItemProps) {
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
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          <CommandItemIndicator>
            <CheckIcon />
          </CommandItemIndicator>
        </>
      )}
    </CommandPrimitive.Item>
  )
}

function CommandItemText({ ...props }: CommandItemTextProps) {
  return <CommandPrimitive.ItemText data-slot="command-item-text" {...props} />
}

function CommandItemIndicator({ className, ...props }: CommandItemIndicatorProps) {
  return (
    <CommandPrimitive.ItemIndicator
      data-slot="command-item-indicator"
      className={cn("ml-auto group-has-data-[slot=command-shortcut]/command-item:hidden", className)}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: CommandShortcutProps) {
  return (
    <ark.span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandItemContext(props: CommandItemContextProps) {
  return <CommandPrimitive.ItemContext {...props} />
}
function CommandLabel({ className, ...props }: CommandLabelProps) {
  return <CommandPrimitive.Label data-slot="command-label" className={cn(className)} {...props} />
}
function CommandRootProvider<T extends CollectionItem>({ className, ...props }: CommandRootProviderProps<T>) {
  return (
    <CommandPrimitive.RootProvider
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl! bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}
function CommandValueText({ className, ...props }: CommandValueTextProps) {
  return <CommandPrimitive.ValueText data-slot="command-value-text" className={cn(className)} {...props} />
}

type CommandRootProps<T extends CollectionItem = CollectionItem> = React.ComponentProps<typeof CommandPrimitive.Root<T>>

type CommandItemContextProps = React.ComponentProps<typeof CommandPrimitive.ItemContext>

type CommandLabelProps = React.ComponentProps<typeof CommandPrimitive.Label>

type CommandRootProviderProps<T extends CollectionItem = CollectionItem> = React.ComponentProps<
  typeof CommandPrimitive.RootProvider<T>
>

type CommandValueTextProps = React.ComponentProps<typeof CommandPrimitive.ValueText>

type CommandContextProps = React.ComponentProps<typeof CommandPrimitive.Context>

type CommandDialogProps = React.ComponentProps<typeof Dialog.Root> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}

type CommandEmptyProps = React.ComponentProps<typeof CommandPrimitive.Empty>

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input> & {
  /** Called with the input text on every change. Wire it to your collection's `filter`. */
  onValueChange?: (value: string) => void
}

type CommandItemProps = Omit<React.ComponentProps<typeof CommandPrimitive.Item>, "item" | "onSelect"> & {
  /** The collection item. Falls back to `value` for string collections. */
  item?: CollectionItem
  value?: string
  /** Called with the item's value when it is selected by click or Enter. */
  onSelect?: SelectHandler
}

type CommandItemIndicatorProps = React.ComponentProps<typeof CommandPrimitive.ItemIndicator>

type CommandItemTextProps = React.ComponentProps<typeof CommandPrimitive.ItemText>

type CommandSeparatorProps = React.ComponentProps<typeof ark.div>

type CommandShortcutProps = React.ComponentProps<typeof ark.span>

type CommandContentProps = React.ComponentProps<typeof CommandPrimitive.Content>

type CommandItemGroupProps = React.ComponentProps<typeof CommandPrimitive.ItemGroup> & {
  /** Group heading text. */
  heading?: React.ReactNode
}

type CommandItemGroupLabelProps = React.ComponentProps<typeof CommandPrimitive.ItemGroupLabel>

const Command = {
  Root: CommandRoot,
  ItemContext: CommandItemContext,
  Label: CommandLabel,
  RootProvider: CommandRootProvider,
  ValueText: CommandValueText,
  Context: CommandContext,
  Dialog: CommandDialog,
  Empty: CommandEmpty,
  Input: CommandInput,
  Item: CommandItem,
  ItemIndicator: CommandItemIndicator,
  ItemText: CommandItemText,
  Separator: CommandSeparator,
  Shortcut: CommandShortcut,
  Content: CommandContent,
  ItemGroup: CommandItemGroup,
  ItemGroupLabel: CommandItemGroupLabel,
}

export {
  useListbox,
  useListboxContext,
  useListboxItemContext,
  Command,
  createListCollection,
  useFilter,
  useListCollection,
  type CollectionItem,
  type ListCollection,
  type CommandRootProps,
  type CommandItemContextProps,
  type CommandLabelProps,
  type CommandRootProviderProps,
  type CommandValueTextProps,
  type CommandContextProps,
  type CommandDialogProps,
  type CommandEmptyProps,
  type CommandInputProps,
  type CommandItemProps,
  type CommandItemIndicatorProps,
  type CommandItemTextProps,
  type CommandSeparatorProps,
  type CommandShortcutProps,
  type CommandContentProps,
  type CommandItemGroupProps,
  type CommandItemGroupLabelProps,
}
