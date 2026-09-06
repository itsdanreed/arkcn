"use client"

import * as React from "react"
import { ark } from "@ark-ui/react"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowLeftIcon, MessagesSquareIcon, SearchIcon, SendIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

/* -------------------------------------------------------------------------- */
/*  Root and context                                                          */
/* -------------------------------------------------------------------------- */

type ChatContextValue = {
  /** Id of the selected conversation. */
  value: string | null
  setValue: (value: string | null) => void
  /** On small screens the panel overlays the list only while this is true. */
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}

const ChatContext = React.createContext<ChatContextValue | null>(null)

function useChat(component = "Chat parts") {
  const ctx = React.useContext(ChatContext)
  if (!ctx) throw new Error(`${component} must be used within <Chat>`)
  return ctx
}

function Chat({
  className,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [mobileOpen, setMobileOpen] = React.useState(value !== null)
  const ctx = React.useMemo(() => ({ value, setValue, mobileOpen, setMobileOpen }), [value, setValue, mobileOpen])
  return (
    <ChatContext.Provider value={ctx}>
      <div
        data-slot="chat"
        data-selected={value !== null ? "" : undefined}
        className={cn("relative flex h-full gap-6", className)}
        {...props}
      />
    </ChatContext.Provider>
  )
}

function ChatContextConsumer({ children }: { children: (ctx: ChatContextValue) => React.ReactNode }) {
  return children(useChat("ChatContext"))
}

/* -------------------------------------------------------------------------- */
/*  Sidebar: header, search, conversation list                                */
/* -------------------------------------------------------------------------- */

function ChatSidebar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-sidebar"
      className={cn("flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80", className)}
      {...props}
    />
  )
}

function ChatSidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-sidebar-header"
      className={cn(
        "sticky top-0 z-10 -mx-4 flex flex-col gap-2 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none",
        className
      )}
      {...props}
    />
  )
}

function ChatSidebarTitle({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="chat-sidebar-title" className={cn("flex items-center justify-between py-2", className)} {...props}>
      {children}
    </div>
  )
}

function ChatSidebarHeading({ className, children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="chat-sidebar-heading"
      className={cn("flex items-center gap-2 text-2xl font-bold", className)}
      {...props}
    >
      {children}
      <MessagesSquareIcon className="size-5" />
    </h1>
  )
}

function ChatSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label
      data-slot="chat-search"
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="sr-only">Search</span>
      <input
        type="text"
        data-slot="chat-search-input"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </label>
  )
}

function ChatConversationList({ className, children, ...props }: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea data-slot="chat-conversation-list" className={cn("-mx-3 h-full flex-1", className)} {...props}>
      <div role="list" className="flex flex-col p-3 *:border-b *:border-border *:last:border-b-0">
        {children}
      </div>
    </ScrollArea>
  )
}

function ChatConversationItem({
  className,
  value,
  onClick,
  asChild,
  ...props
}: React.ComponentProps<typeof ark.button> & { value: string }) {
  const ctx = useChat("ChatConversationItem")
  const selected = ctx.value === value
  return (
    <div role="listitem" className="py-1">
      <ark.button
        asChild={asChild}
        type="button"
        data-slot="chat-conversation-item"
        data-selected={selected ? "" : undefined}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "group/chat-conversation-item flex w-full gap-2 rounded-md p-2 text-start text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:sm:bg-muted",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented) return
          ctx.setValue(value)
          ctx.setMobileOpen(true)
        }}
        {...props}
      />
    </div>
  )
}

function ChatConversationInfo({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-conversation-info" className={cn("flex min-w-0 flex-col", className)} {...props} />
}

function ChatConversationName({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="chat-conversation-name" className={cn("font-medium", className)} {...props} />
}

function ChatConversationPreview({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-conversation-preview"
      className={cn(
        "line-clamp-2 text-muted-foreground group-hover/chat-conversation-item:text-accent-foreground/90",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Panel: header, messages, composer                                         */
/* -------------------------------------------------------------------------- */

function ChatPanel({ className, ...props }: React.ComponentProps<"div">) {
  const ctx = useChat("ChatPanel")
  return (
    <div
      data-slot="chat-panel"
      data-mobile-open={ctx.mobileOpen ? "" : undefined}
      className={cn(
        "absolute inset-0 inset-s-full z-50 hidden w-full flex-1 flex-col border bg-background shadow-xs data-mobile-open:inset-s-0 data-mobile-open:flex sm:static sm:z-auto sm:flex sm:rounded-md",
        className
      )}
      {...props}
    />
  )
}

function ChatHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header"
      className={cn(
        "mb-1 flex flex-none items-center justify-between gap-3 bg-card p-4 shadow-lg sm:rounded-t-md",
        className
      )}
      {...props}
    />
  )
}

/** Returns to the conversation list on small screens. Polymorphic via `asChild`. */
function ChatBackTrigger({ className, onClick, children, asChild, ...props }: React.ComponentProps<typeof Button>) {
  const ctx = useChat("ChatBackTrigger")
  return (
    <Button
      data-slot="chat-back-trigger"
      size="icon"
      variant="ghost"
      asChild={asChild}
      className={cn("-ms-2 sm:hidden", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) ctx.setMobileOpen(false)
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <ArrowLeftIcon className="rtl:rotate-180" />
              <span className="sr-only">Back</span>
            </>
          ))}
    </Button>
  )
}

function ChatHeaderInfo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header-info"
      className={cn("flex min-w-0 items-center gap-2 lg:gap-4", className)}
      {...props}
    />
  )
}

function ChatHeaderText({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-header-text" className={cn("flex min-w-0 flex-col", className)} {...props} />
}

function ChatHeaderTitle({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="chat-header-title" className={cn("text-sm font-medium lg:text-base", className)} {...props} />
}

function ChatHeaderDescription({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-header-description"
      className={cn("line-clamp-1 max-w-32 text-xs text-muted-foreground lg:max-w-none lg:text-sm", className)}
      {...props}
    />
  )
}

function ChatHeaderActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-header-actions"
      className={cn("-me-1 flex items-center gap-1 lg:gap-2", className)}
      {...props}
    />
  )
}

function ChatBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-body" className={cn("flex flex-1 flex-col gap-2 px-4 pt-0 pb-4", className)} {...props} />
}

/**
 * Bottom-anchored message stream. Render messages newest-first: the column is
 * reversed so the latest message sits at the bottom and the scroll position
 * stays pinned there as messages arrive.
 */
function ChatMessages({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="chat-messages" className="relative -me-4 flex flex-1 flex-col overflow-y-hidden">
      <div
        data-slot="chat-messages-viewport"
        className={cn(
          "flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pe-4 pb-4",
          className
        )}
        {...props}
      />
    </div>
  )
}

function ChatDateSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-date-separator" className={cn("text-center text-xs", className)} {...props} />
}

const chatMessageVariants = cva("group/chat-message max-w-72 px-3 py-2 wrap-break-word shadow-lg", {
  variants: {
    variant: {
      sent: "self-end rounded-[16px_16px_0_16px] bg-primary/90 text-primary-foreground/75",
      received: "self-start rounded-[16px_16px_16px_0] bg-muted",
    },
  },
  defaultVariants: { variant: "received" },
})

function ChatMessage({
  className,
  variant = "received",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof chatMessageVariants>) {
  return (
    <div
      data-slot="chat-message"
      data-variant={variant}
      className={cn(chatMessageVariants({ variant }), className)}
      {...props}
    />
  )
}

function ChatMessageTime({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="chat-message-time"
      className={cn(
        "mt-1 block text-xs font-light text-foreground/75 italic group-data-[variant=sent]/chat-message:text-end group-data-[variant=sent]/chat-message:text-primary-foreground/85",
        className
      )}
      {...props}
    />
  )
}

function ChatComposer({ className, ...props }: React.ComponentProps<"form">) {
  return <form data-slot="chat-composer" className={cn("flex w-full flex-none gap-2", className)} {...props} />
}

function ChatComposerField({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-composer-field"
      className={cn(
        "flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 lg:gap-4",
        className
      )}
      {...props}
    />
  )
}

function ChatComposerActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-composer-actions" className={cn("flex items-center gap-1", className)} {...props} />
}

function ChatComposerInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label className="flex-1">
      <span className="sr-only">Message</span>
      <input
        type="text"
        data-slot="chat-composer-input"
        className={cn(
          "h-8 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    </label>
  )
}

/** Submits the composer form. Polymorphic via `asChild`. */
function ChatComposerSendTrigger({
  className,
  children,
  asChild,
  variant = "ghost",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="chat-composer-send-trigger"
      type="submit"
      variant={variant}
      size={size}
      asChild={asChild}
      className={className}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <SendIcon />
              <span className="sr-only">Send</span>
            </>
          ))}
    </Button>
  )
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

function ChatEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-empty"
      className={cn(
        "absolute inset-0 inset-s-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex",
        className
      )}
      {...props}
    />
  )
}

function ChatEmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="chat-empty-content" className={cn("flex flex-col items-center gap-6", className)} {...props} />
}

function ChatEmptyIcon({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-empty-icon"
      className={cn(
        "flex size-16 items-center justify-center rounded-full border-2 border-border [&_svg]:size-8",
        className
      )}
      {...props}
    >
      {children ?? <MessagesSquareIcon />}
    </div>
  )
}

function ChatEmptyTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="chat-empty-title" className={cn("text-center text-xl font-semibold", className)} {...props} />
}

function ChatEmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="chat-empty-description"
      className={cn("text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Group items by a key while preserving first-seen order of the keys. */
function groupBy<T>(items: T[], getKey: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = getKey(item)
    const list = groups.get(key)
    if (list) list.push(item)
    else groups.set(key, [item])
  }
  return Array.from(groups.entries())
}

/** "Jane Doe" -> "JD"; single word -> first two letters; empty -> "?". */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export {
  Chat,
  ChatBackTrigger,
  ChatBody,
  ChatComposer,
  ChatComposerActions,
  ChatComposerField,
  ChatComposerInput,
  ChatComposerSendTrigger,
  ChatContextConsumer as ChatContext,
  ChatConversationInfo,
  ChatConversationItem,
  ChatConversationList,
  ChatConversationName,
  ChatConversationPreview,
  ChatDateSeparator,
  ChatEmpty,
  ChatEmptyContent,
  ChatEmptyDescription,
  ChatEmptyIcon,
  ChatEmptyTitle,
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderDescription,
  ChatHeaderInfo,
  ChatHeaderText,
  ChatHeaderTitle,
  ChatMessage,
  ChatMessageTime,
  ChatMessages,
  ChatPanel,
  ChatSearch,
  ChatSidebar,
  ChatSidebarHeader,
  ChatSidebarHeading,
  ChatSidebarTitle,
  chatMessageVariants,
  getInitials,
  groupBy,
  useChat,
}
