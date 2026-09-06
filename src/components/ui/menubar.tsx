"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"
import { Menu as MenubarPrimitive, Portal as PortalPrimitive } from "@ark-ui/react"
import { CheckIcon, ChevronRightIcon } from "lucide-react"

/**
 * Ark UI has no Menubar primitive. `Menubar` composes Ark `Menu` roots and adds
 * the menubar behaviours Radix provides: one open menu at a time, hover
 * switching between triggers once a menu is open, roving tabindex across
 * triggers, and ArrowLeft/ArrowRight moving between menus.
 */

type MenubarContextValue = {
  value: string | null
  setValue: (value: string | null) => void
  loop: boolean
  register: (id: string) => () => void
  order: string[]
  rootRef: React.RefObject<HTMLDivElement | null>
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null)
const MenubarMenuContext = React.createContext<string | null>(null)

function useMenubar(component: string) {
  const ctx = React.useContext(MenubarContext)
  if (!ctx) throw new Error(`${component} must be used within <Menubar>`)
  return ctx
}

function useMenubarMenu(component: string) {
  const id = React.useContext(MenubarMenuContext)
  if (!id) throw new Error(`${component} must be used within <MenubarMenu>`)
  return id
}

function Menubar({
  className,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  loop = false,
  ...props
}: Omit<React.ComponentProps<"div">, "value" | "defaultValue"> & {
  /** The id of the open menu (controlled). */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  /** Whether ArrowLeft/ArrowRight wrap around at the ends. */
  loop?: boolean
}) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [order, setOrder] = React.useState<string[]>([])
  const register = React.useCallback((id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]))
    return () => setOrder((prev) => prev.filter((x) => x !== id))
  }, [])
  const rootRef = React.useRef<HTMLDivElement>(null)
  const ctx = React.useMemo(
    () => ({ value, setValue, loop, register, order, rootRef }),
    [value, setValue, loop, register, order]
  )
  return (
    <MenubarContext.Provider value={ctx}>
      <div
        ref={rootRef}
        role="menubar"
        data-slot="menubar"
        className={cn("flex h-8 items-center gap-0.5 rounded-lg border p-0.75", className)}
        {...props}
      />
    </MenubarContext.Provider>
  )
}

function useMenubarNavigation() {
  const ctx = useMenubar("MenubarTrigger")
  return React.useCallback(
    (fromId: string, direction: 1 | -1, open: boolean) => {
      const { order, loop, rootRef, setValue } = ctx
      const index = order.indexOf(fromId)
      let next = index + direction
      if (next < 0) next = loop ? order.length - 1 : 0
      if (next >= order.length) next = loop ? 0 : order.length - 1
      const nextId = order[next]
      if (!nextId || nextId === fromId) return
      const trigger = rootRef.current?.querySelector<HTMLElement>(
        `[data-slot="menubar-trigger"][data-menubar-value="${nextId}"]`
      )
      trigger?.focus()
      setValue(open ? nextId : null)
    },
    [ctx]
  )
}

function MenubarMenu({
  value: valueProp,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  onOpenChange,
  ...props
}: Omit<React.ComponentProps<typeof MenubarPrimitive.Root>, "open" | "defaultOpen"> & {
  /** Identifies this menu within the menubar. Auto-generated when omitted. */
  value?: string
}) {
  const ctx = useMenubar("MenubarMenu")
  const generated = React.useId()
  const id = valueProp ?? generated
  React.useEffect(() => ctx.register(id), [ctx.register, id])
  return (
    <MenubarMenuContext.Provider value={id}>
      <MenubarPrimitive.Root
        open={ctx.value === id}
        onOpenChange={(details) => {
          ctx.setValue(details.open ? id : ctx.value === id ? null : ctx.value)
          onOpenChange?.(details)
        }}
        positioning={{
          placement: "bottom-start",
          gutter: 8,
          offset: { crossAxis: -4 },
          ...positioning,
        }}
        lazyMount={lazyMount}
        unmountOnExit={unmountOnExit}
        {...props}
      />
    </MenubarMenuContext.Provider>
  )
}

function MenubarTrigger({
  className,
  onPointerEnter,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  const ctx = useMenubar("MenubarTrigger")
  const id = useMenubarMenu("MenubarTrigger")
  const navigate = useMenubarNavigation()
  const isOpen = ctx.value === id
  const isFirst = ctx.order[0] === id
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      data-menubar-value={id}
      tabIndex={isOpen || (ctx.value === null && isFirst) ? 0 : -1}
      className={cn(
        "flex items-center rounded-sm px-1.5 py-0.5 text-sm font-medium outline-hidden select-none hover:bg-muted aria-expanded:bg-muted",
        className
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (ctx.value !== null && ctx.value !== id) ctx.setValue(id)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault()
          navigate(id, event.key === "ArrowRight" ? 1 : -1, isOpen)
        }
      }}
      {...props}
    />
  )
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof PortalPrimitive>) {
  return <PortalPrimitive {...props} />
}

function MenubarMenuContext_({ ...props }: React.ComponentProps<typeof MenubarPrimitive.Context>) {
  return <MenubarPrimitive.Context {...props} />
}

function MenubarPositioner({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Positioner>) {
  return (
    <MenubarPrimitive.Positioner
      data-slot="menubar-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function MenubarContent({ className, onKeyDown, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  const id = useMenubarMenu("MenubarContent")
  const navigate = useMenubarNavigation()
  return (
    <MenubarPortal>
      <MenubarPositioner>
        <MenubarPrimitive.Content
          data-slot="menubar-content"
          className={cn(
            "z-50 min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            className
          )}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
            const target = event.target as HTMLElement
            // Inside a submenu, Ark owns ArrowLeft (close) and ArrowRight.
            if (target.closest('[data-slot="menubar-sub-content"]')) return
            // On a highlighted sub trigger, ArrowRight opens the submenu.
            if (
              event.key === "ArrowRight" &&
              event.currentTarget.querySelector('[data-slot="menubar-sub-trigger"][data-highlighted]')
            )
              return
            event.preventDefault()
            navigate(id, event.key === "ArrowRight" ? 1 : -1, true)
          }}
          {...props}
        />
      </MenubarPositioner>
    </MenubarPortal>
  )
}

function MenubarArrow({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Arrow>) {
  return (
    <MenubarPrimitive.Arrow
      data-slot="menubar-arrow"
      className={cn("[--arrow-background:var(--color-popover)] [--arrow-size:0.625rem]", className)}
      {...props}
    >
      <MenubarPrimitive.ArrowTip data-slot="menubar-arrow-tip" className="border-t border-l border-foreground/10" />
    </MenubarPrimitive.Arrow>
  )
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.ItemGroup>) {
  return <MenubarPrimitive.ItemGroup data-slot="menubar-group" {...props} />
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  value,
  ...props
}: Omit<React.ComponentProps<typeof MenubarPrimitive.Item>, "value"> & {
  value?: string
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const id = React.useId()
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      value={value ?? id}
      className={cn(
        "group/menubar-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/10 data-[variant=destructive]:data-highlighted:text-destructive dark:data-[variant=destructive]:data-highlighted:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  )
}

function MenubarItemText({ ...props }: React.ComponentProps<typeof MenubarPrimitive.ItemText>) {
  return <MenubarPrimitive.ItemText data-slot="menubar-item-text" {...props} />
}

function MenubarItemIndicator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.ItemIndicator>) {
  return (
    <MenubarPrimitive.ItemIndicator
      data-slot="menubar-item-indicator"
      className={cn("pointer-events-none absolute right-2 flex items-center justify-center", className)}
      {...props}
    />
  )
}

const optionItemClassName =
  "relative flex cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function MenubarCheckboxItem({
  className,
  children,
  checked = false,
  inset,
  value,
  ...props
}: Omit<React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>, "checked" | "value"> & {
  checked?: boolean
  value?: string
  inset?: boolean
}) {
  const id = React.useId()
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      data-inset={inset}
      className={cn(optionItemClassName, className)}
      checked={checked}
      value={value ?? id}
      {...props}
    >
      <MenubarItemIndicator data-slot="menubar-checkbox-item-indicator">
        <CheckIcon />
      </MenubarItemIndicator>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItemGroup>) {
  return <MenubarPrimitive.RadioItemGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      data-inset={inset}
      className={cn(optionItemClassName, className)}
      {...props}
    >
      <MenubarItemIndicator data-slot="menubar-radio-item-indicator">
        <CheckIcon />
      </MenubarItemIndicator>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.ItemGroupLabel> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.ItemGroupLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-1.5 py-1 text-sm font-medium data-inset:pl-7", className)}
      {...props}
    />
  )
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground group-data-highlighted/menubar-item:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return <MenubarPrimitive.Root lazyMount={lazyMount} unmountOnExit={unmountOnExit} {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.TriggerItem> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.TriggerItem
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:pl-7 data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenubarPrimitive.TriggerItem>
  )
}

function MenubarSubContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPositioner>
        <MenubarPrimitive.Content
          data-slot="menubar-sub-content"
          className={cn(
            "z-50 min-w-32 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </MenubarPositioner>
    </MenubarPortal>
  )
}

export {
  Menubar,
  MenubarArrow,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarMenuContext_ as MenubarContext,
  MenubarGroup,
  MenubarItem,
  MenubarItemIndicator,
  MenubarItemText,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarPositioner,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
