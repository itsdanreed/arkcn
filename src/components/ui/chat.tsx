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

const ChatContextStore = React.createContext<ChatContextValue | null>(null)

function useChat(component = "Chat parts") {
  const ctx = React.useContext(ChatContextStore)
  if (!ctx) throw new Error(`${component} must be used within <Chat>`)
  return ctx
}

function ChatRoot({ className, value: valueProp, defaultValue = null, onValueChange, ...props }: ChatRootProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [mobileOpen, setMobileOpen] = React.useState(value !== null)
  const ctx = React.useMemo(() => ({ value, setValue, mobileOpen, setMobileOpen }), [value, setValue, mobileOpen])
  return (
    <ChatContextStore.Provider value={ctx}>
      <ark.div
        data-slot="chat"
        data-selected={value !== null ? "" : undefined}
        className={cn("relative flex h-full gap-6", className)}
        {...props}
      />
    </ChatContextStore.Provider>
  )
}

function ChatContext({ children }: ChatContextProps) {
  return children(useChat("ChatContext"))
}

/* -------------------------------------------------------------------------- */
/*  Sidebar: header, search, conversation list                                */
/* -------------------------------------------------------------------------- */

function ChatSidebar({ className, ...props }: ChatSidebarProps) {
  return (
    <ark.div
      data-slot="chat-sidebar"
      className={cn("flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80", className)}
      {...props}
    />
  )
}

function ChatSidebarHeader({ className, ...props }: ChatSidebarHeaderProps) {
  return (
    <ark.div
      data-slot="chat-sidebar-header"
      className={cn(
        "sticky top-0 z-10 -mx-4 flex flex-col gap-2 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none",
        className
      )}
      {...props}
    />
  )
}

function ChatSidebarTitle({ className, children, ...props }: ChatSidebarTitleProps) {
  return (
    <ark.div
      data-slot="chat-sidebar-title"
      className={cn("flex items-center justify-between py-2", className)}
      {...props}
    >
      {children}
    </ark.div>
  )
}

function ChatSidebarHeading({ className, children, ...props }: ChatSidebarHeadingProps) {
  return (
    <ark.h1
      data-slot="chat-sidebar-heading"
      className={cn("flex items-center gap-2 text-2xl font-bold", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          <MessagesSquareIcon className="size-5" />
        </>
      )}
    </ark.h1>
  )
}

function ChatSearch({ className, ...props }: ChatSearchProps) {
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
      <ark.input
        type="text"
        data-slot="chat-search-input"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </label>
  )
}

function ChatConversationList({ className, children, ...props }: ChatConversationListProps) {
  return (
    <ScrollArea.Root data-slot="chat-conversation-list" className={cn("-mx-3 h-full flex-1", className)} {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div role="list" className="flex flex-col p-3 *:border-b *:border-border *:last:border-b-0">
            {children}
          </div>
        </>
      )}
    </ScrollArea.Root>
  )
}

function ChatConversationItem({ className, value, onClick, asChild, ...props }: ChatConversationItemProps) {
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

function ChatConversationInfo({ className, ...props }: ChatConversationInfoProps) {
  return <ark.div data-slot="chat-conversation-info" className={cn("flex min-w-0 flex-col", className)} {...props} />
}

function ChatConversationName({ className, ...props }: ChatConversationNameProps) {
  return <ark.span data-slot="chat-conversation-name" className={cn("font-medium", className)} {...props} />
}

function ChatConversationPreview({ className, ...props }: ChatConversationPreviewProps) {
  return (
    <ark.span
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

function ChatPanel({ className, ...props }: ChatPanelProps) {
  const ctx = useChat("ChatPanel")
  return (
    <ark.div
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

function ChatHeader({ className, ...props }: ChatHeaderProps) {
  return (
    <ark.div
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
function ChatBackTrigger({ className, onClick, children, asChild, ...props }: ChatBackTriggerProps) {
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

function ChatHeaderInfo({ className, ...props }: ChatHeaderInfoProps) {
  return (
    <ark.div
      data-slot="chat-header-info"
      className={cn("flex min-w-0 items-center gap-2 lg:gap-4", className)}
      {...props}
    />
  )
}

function ChatHeaderText({ className, ...props }: ChatHeaderTextProps) {
  return <ark.div data-slot="chat-header-text" className={cn("flex min-w-0 flex-col", className)} {...props} />
}

function ChatHeaderTitle({ className, ...props }: ChatHeaderTitleProps) {
  return (
    <ark.span data-slot="chat-header-title" className={cn("text-sm font-medium lg:text-base", className)} {...props} />
  )
}

function ChatHeaderDescription({ className, ...props }: ChatHeaderDescriptionProps) {
  return (
    <ark.span
      data-slot="chat-header-description"
      className={cn("line-clamp-1 max-w-32 text-xs text-muted-foreground lg:max-w-none lg:text-sm", className)}
      {...props}
    />
  )
}

function ChatHeaderActions({ className, ...props }: ChatHeaderActionsProps) {
  return (
    <ark.div
      data-slot="chat-header-actions"
      className={cn("-me-1 flex items-center gap-1 lg:gap-2", className)}
      {...props}
    />
  )
}

function ChatBody({ className, ...props }: ChatBodyProps) {
  return (
    <ark.div data-slot="chat-body" className={cn("flex flex-1 flex-col gap-2 px-4 pt-0 pb-4", className)} {...props} />
  )
}

/**
 * Bottom-anchored message stream. Render messages newest-first: the column is
 * reversed so the latest message sits at the bottom and the scroll position
 * stays pinned there as messages arrive.
 */
function ChatMessages({ className, ...props }: ChatMessagesProps) {
  return (
    <div data-slot="chat-messages" className="relative -me-4 flex flex-1 flex-col overflow-y-hidden">
      <ark.div
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

function ChatDateSeparator({ className, ...props }: ChatDateSeparatorProps) {
  return <ark.div data-slot="chat-date-separator" className={cn("text-center text-xs", className)} {...props} />
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

function ChatMessage({ className, variant = "received", ...props }: ChatMessageProps) {
  return (
    <ark.div
      data-slot="chat-message"
      data-variant={variant}
      className={cn(chatMessageVariants({ variant }), className)}
      {...props}
    />
  )
}

function ChatMessageTime({ className, ...props }: ChatMessageTimeProps) {
  return (
    <ark.span
      data-slot="chat-message-time"
      className={cn(
        "mt-1 block text-xs font-light text-foreground/75 italic group-data-[variant=sent]/chat-message:text-end group-data-[variant=sent]/chat-message:text-primary-foreground/85",
        className
      )}
      {...props}
    />
  )
}

function ChatComposer({ className, ...props }: ChatComposerProps) {
  return <ark.form data-slot="chat-composer" className={cn("flex w-full flex-none gap-2", className)} {...props} />
}

function ChatComposerField({ className, ...props }: ChatComposerFieldProps) {
  return (
    <ark.div
      data-slot="chat-composer-field"
      className={cn(
        "flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 transition-colors has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 lg:gap-4",
        className
      )}
      {...props}
    />
  )
}

function ChatComposerActions({ className, ...props }: ChatComposerActionsProps) {
  return <ark.div data-slot="chat-composer-actions" className={cn("flex items-center gap-1", className)} {...props} />
}

function ChatComposerInput({ className, ...props }: ChatComposerInputProps) {
  return (
    <label className="flex-1">
      <span className="sr-only">Message</span>
      <ark.input
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
}: ChatComposerSendTriggerProps) {
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

function ChatEmpty({ className, ...props }: ChatEmptyProps) {
  return (
    <ark.div
      data-slot="chat-empty"
      className={cn(
        "absolute inset-0 inset-s-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex",
        className
      )}
      {...props}
    />
  )
}

function ChatEmptyContent({ className, ...props }: ChatEmptyContentProps) {
  return (
    <ark.div data-slot="chat-empty-content" className={cn("flex flex-col items-center gap-6", className)} {...props} />
  )
}

function ChatEmptyIcon({ className, children, ...props }: ChatEmptyIconProps) {
  return (
    <ark.div
      data-slot="chat-empty-icon"
      className={cn(
        "flex size-16 items-center justify-center rounded-full border-2 border-border [&_svg]:size-8",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <MessagesSquareIcon />}</>}
    </ark.div>
  )
}

function ChatEmptyTitle({ className, ...props }: ChatEmptyTitleProps) {
  return (
    <ark.h2 data-slot="chat-empty-title" className={cn("text-center text-xl font-semibold", className)} {...props} />
  )
}

function ChatEmptyDescription({ className, ...props }: ChatEmptyDescriptionProps) {
  return (
    <ark.p
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

type ChatContextProps = { children: (ctx: ChatContextValue) => React.ReactNode }

type ChatRootProps = Omit<React.ComponentProps<typeof ark.div>, "defaultValue"> & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

type ChatBackTriggerProps = React.ComponentProps<typeof Button>

type ChatBodyProps = React.ComponentProps<typeof ark.div>

type ChatComposerProps = React.ComponentProps<typeof ark.form>

type ChatComposerActionsProps = React.ComponentProps<typeof ark.div>

type ChatComposerFieldProps = React.ComponentProps<typeof ark.div>

type ChatComposerInputProps = React.ComponentProps<typeof ark.input>

type ChatComposerSendTriggerProps = React.ComponentProps<typeof Button>

type ChatConversationInfoProps = React.ComponentProps<typeof ark.div>

type ChatConversationItemProps = React.ComponentProps<typeof ark.button> & { value: string }

type ChatConversationListProps = React.ComponentProps<typeof ScrollArea.Root>

type ChatConversationNameProps = React.ComponentProps<typeof ark.span>

type ChatConversationPreviewProps = React.ComponentProps<typeof ark.span>

type ChatDateSeparatorProps = React.ComponentProps<typeof ark.div>

type ChatEmptyProps = React.ComponentProps<typeof ark.div>

type ChatEmptyContentProps = React.ComponentProps<typeof ark.div>

type ChatEmptyDescriptionProps = React.ComponentProps<typeof ark.p>

type ChatEmptyIconProps = React.ComponentProps<typeof ark.div>

type ChatEmptyTitleProps = React.ComponentProps<typeof ark.h2>

type ChatHeaderProps = React.ComponentProps<typeof ark.div>

type ChatHeaderActionsProps = React.ComponentProps<typeof ark.div>

type ChatHeaderDescriptionProps = React.ComponentProps<typeof ark.span>

type ChatHeaderInfoProps = React.ComponentProps<typeof ark.div>

type ChatHeaderTextProps = React.ComponentProps<typeof ark.div>

type ChatHeaderTitleProps = React.ComponentProps<typeof ark.span>

type ChatMessageProps = React.ComponentProps<typeof ark.div> & VariantProps<typeof chatMessageVariants>

type ChatMessageTimeProps = React.ComponentProps<typeof ark.span>

type ChatMessagesProps = React.ComponentProps<typeof ark.div>

type ChatPanelProps = React.ComponentProps<typeof ark.div>

type ChatSearchProps = React.ComponentProps<typeof ark.input>

type ChatSidebarProps = React.ComponentProps<typeof ark.div>

type ChatSidebarHeaderProps = React.ComponentProps<typeof ark.div>

type ChatSidebarHeadingProps = React.ComponentProps<typeof ark.h1>

type ChatSidebarTitleProps = React.ComponentProps<typeof ark.div>

const Chat = {
  Context: ChatContext,
  Root: ChatRoot,
  BackTrigger: ChatBackTrigger,
  Body: ChatBody,
  Composer: ChatComposer,
  ComposerActions: ChatComposerActions,
  ComposerField: ChatComposerField,
  ComposerInput: ChatComposerInput,
  ComposerSendTrigger: ChatComposerSendTrigger,
  ConversationInfo: ChatConversationInfo,
  ConversationItem: ChatConversationItem,
  ConversationList: ChatConversationList,
  ConversationName: ChatConversationName,
  ConversationPreview: ChatConversationPreview,
  DateSeparator: ChatDateSeparator,
  Empty: ChatEmpty,
  EmptyContent: ChatEmptyContent,
  EmptyDescription: ChatEmptyDescription,
  EmptyIcon: ChatEmptyIcon,
  EmptyTitle: ChatEmptyTitle,
  Header: ChatHeader,
  HeaderActions: ChatHeaderActions,
  HeaderDescription: ChatHeaderDescription,
  HeaderInfo: ChatHeaderInfo,
  HeaderText: ChatHeaderText,
  HeaderTitle: ChatHeaderTitle,
  Message: ChatMessage,
  MessageTime: ChatMessageTime,
  Messages: ChatMessages,
  Panel: ChatPanel,
  Search: ChatSearch,
  Sidebar: ChatSidebar,
  SidebarHeader: ChatSidebarHeader,
  SidebarHeading: ChatSidebarHeading,
  SidebarTitle: ChatSidebarTitle,
}

export {
  Chat,
  chatMessageVariants,
  getInitials,
  groupBy,
  useChat,
  type ChatContextProps,
  type ChatRootProps,
  type ChatBackTriggerProps,
  type ChatBodyProps,
  type ChatComposerProps,
  type ChatComposerActionsProps,
  type ChatComposerFieldProps,
  type ChatComposerInputProps,
  type ChatComposerSendTriggerProps,
  type ChatConversationInfoProps,
  type ChatConversationItemProps,
  type ChatConversationListProps,
  type ChatConversationNameProps,
  type ChatConversationPreviewProps,
  type ChatDateSeparatorProps,
  type ChatEmptyProps,
  type ChatEmptyContentProps,
  type ChatEmptyDescriptionProps,
  type ChatEmptyIconProps,
  type ChatEmptyTitleProps,
  type ChatHeaderProps,
  type ChatHeaderActionsProps,
  type ChatHeaderDescriptionProps,
  type ChatHeaderInfoProps,
  type ChatHeaderTextProps,
  type ChatHeaderTitleProps,
  type ChatMessageProps,
  type ChatMessageTimeProps,
  type ChatMessagesProps,
  type ChatPanelProps,
  type ChatSearchProps,
  type ChatSidebarProps,
  type ChatSidebarHeaderProps,
  type ChatSidebarHeadingProps,
  type ChatSidebarTitleProps,
}
