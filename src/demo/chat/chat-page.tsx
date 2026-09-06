import * as React from "react"
import { format } from "date-fns"
import {
  ImagePlusIcon,
  MoreVerticalIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  SquarePenIcon,
  VideoIcon,
  SendIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Chat,
  ChatBackTrigger,
  ChatBody,
  ChatComposer,
  ChatComposerActions,
  ChatComposerField,
  ChatComposerInput,
  ChatComposerSendTrigger,
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
  getInitials,
  groupBy,
} from "@/components/ui/chat"
import { conversations as initialConversations, type ChatUser } from "./data"
import { NewChat } from "./new-chat"

export function ChatPage() {
  const [conversations, setConversations] = React.useState<ChatUser[]>(initialConversations)
  const [search, setSearch] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const [newChatOpen, setNewChatOpen] = React.useState(false)

  const filtered = conversations.filter((c) => c.fullName.toLowerCase().includes(search.trim().toLowerCase()))
  const selected = conversations.find((c) => c.id === selectedId) ?? null
  // Messages are stored newest-first, matching the reversed message column.
  const groups = selected ? groupBy(selected.messages, (m) => format(new Date(m.timestamp), "d MMM, yyyy")) : []

  const send = (event: React.FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text || !selected) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              messages: [{ sender: "You", message: text, timestamp: new Date().toISOString() }, ...c.messages],
            }
          : c
      )
    )
    setDraft("")
  }

  return (
    <>
      <Chat value={selectedId} onValueChange={setSelectedId} className="min-h-0 flex-1">
        <ChatSidebar>
          <ChatSidebarHeader>
            <ChatSidebarTitle>
              <ChatSidebarHeading>Inbox</ChatSidebarHeading>
              <Button size="icon" variant="ghost" onClick={() => setNewChatOpen(true)} aria-label="New message">
                <SquarePenIcon className="text-muted-foreground" />
              </Button>
            </ChatSidebarTitle>
            <ChatSearch placeholder="Search chat..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </ChatSidebarHeader>
          <ChatConversationList>
            {filtered.map((user) => {
              const last = user.messages[0]
              const preview = last.sender === "You" ? `You: ${last.message}` : last.message
              return (
                <ChatConversationItem key={user.id} value={user.id}>
                  <Avatar>
                    <AvatarImage src={user.profile} alt={user.username} />
                    <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <ChatConversationInfo>
                    <ChatConversationName>{user.fullName}</ChatConversationName>
                    <ChatConversationPreview>{preview}</ChatConversationPreview>
                  </ChatConversationInfo>
                </ChatConversationItem>
              )
            })}
          </ChatConversationList>
        </ChatSidebar>

        {selected ? (
          <ChatPanel>
            <ChatHeader>
              <div className="flex min-w-0 gap-3">
                <ChatBackTrigger />
                <ChatHeaderInfo>
                  <Avatar className="size-9 lg:size-11">
                    <AvatarImage src={selected.profile} alt={selected.username} />
                    <AvatarFallback>{getInitials(selected.fullName)}</AvatarFallback>
                  </Avatar>
                  <ChatHeaderText>
                    <ChatHeaderTitle>{selected.fullName}</ChatHeaderTitle>
                    <ChatHeaderDescription>{selected.title}</ChatHeaderDescription>
                  </ChatHeaderText>
                </ChatHeaderInfo>
              </div>
              <ChatHeaderActions>
                <Button
                  size="icon"
                  variant="ghost"
                  className="hidden rounded-full sm:inline-flex"
                  aria-label="Video call"
                >
                  <VideoIcon className="text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" className="hidden rounded-full sm:inline-flex" aria-label="Call">
                  <PhoneIcon className="text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="More">
                  <MoreVerticalIcon className="text-muted-foreground" />
                </Button>
              </ChatHeaderActions>
            </ChatHeader>
            <ChatBody>
              <ChatMessages>
                {groups.map(([day, messages]) => (
                  <React.Fragment key={day}>
                    {messages.map((msg, index) => (
                      <ChatMessage
                        key={`${msg.sender}-${msg.timestamp}-${index}`}
                        variant={msg.sender === "You" ? "sent" : "received"}
                      >
                        {msg.message}
                        <ChatMessageTime>{format(new Date(msg.timestamp), "h:mm a")}</ChatMessageTime>
                      </ChatMessage>
                    ))}
                    <ChatDateSeparator>{day}</ChatDateSeparator>
                  </React.Fragment>
                ))}
              </ChatMessages>
              <ChatComposer onSubmit={send}>
                <ChatComposerField>
                  <ChatComposerActions>
                    <Button size="icon-sm" type="button" variant="ghost" aria-label="Add">
                      <PlusIcon className="text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      className="hidden lg:inline-flex"
                      aria-label="Add image"
                    >
                      <ImagePlusIcon className="text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      className="hidden lg:inline-flex"
                      aria-label="Attach file"
                    >
                      <PaperclipIcon className="text-muted-foreground" />
                    </Button>
                  </ChatComposerActions>
                  <ChatComposerInput
                    placeholder="Type your messages..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <ChatComposerSendTrigger className="hidden sm:inline-flex" />
                </ChatComposerField>
                <ChatComposerSendTrigger variant="default" size="default" className="h-full sm:hidden">
                  <SendIcon /> Send
                </ChatComposerSendTrigger>
              </ChatComposer>
            </ChatBody>
          </ChatPanel>
        ) : (
          <ChatEmpty>
            <ChatEmptyContent>
              <ChatEmptyIcon />
              <div className="flex flex-col gap-2">
                <ChatEmptyTitle>Your messages</ChatEmptyTitle>
                <ChatEmptyDescription>Send a message to start a chat.</ChatEmptyDescription>
              </div>
              <Button onClick={() => setNewChatOpen(true)}>Send message</Button>
            </ChatEmptyContent>
          </ChatEmpty>
        )}
      </Chat>
      <NewChat
        users={conversations.map(({ messages: _m, ...user }) => user)}
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
      />
    </>
  )
}
