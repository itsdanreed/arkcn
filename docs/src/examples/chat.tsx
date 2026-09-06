import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Chat,
  ChatBody,
  ChatComposer,
  ChatComposerField,
  ChatComposerInput,
  ChatComposerSendTrigger,
  ChatConversationInfo,
  ChatConversationItem,
  ChatConversationList,
  ChatConversationName,
  ChatConversationPreview,
  ChatHeader,
  ChatHeaderInfo,
  ChatHeaderText,
  ChatHeaderTitle,
  ChatMessage,
  ChatMessageTime,
  ChatMessages,
  ChatPanel,
  ChatSidebar,
  ChatSidebarHeader,
  ChatSidebarHeading,
  ChatSidebarTitle,
} from "@/components/ui/chat"

type Msg = { from: "me" | "them"; text: string; time: string }
const seed: Record<string, { name: string; initials: string; messages: Msg[] }> = {
  ava: {
    name: "Ava Chen",
    initials: "AC",
    messages: [
      { from: "them", text: "Docs look great!", time: "9:12 AM" },
      { from: "me", text: "Thanks, shipping today.", time: "9:15 AM" },
    ],
  },
  noah: {
    name: "Noah Patel",
    initials: "NP",
    messages: [{ from: "them", text: "Can you review my PR?", time: "Yesterday" }],
  },
}

export default function ChatExample() {
  const [selected, setSelected] = React.useState<string | null>("ava")
  const [threads, setThreads] = React.useState(seed)
  const [draft, setDraft] = React.useState("")
  const thread = selected ? threads[selected] : null
  const send = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected || !draft.trim()) return
    setThreads((prev) => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        messages: [...prev[selected].messages, { from: "me", text: draft, time: "now" }],
      },
    }))
    setDraft("")
  }
  return (
    <Chat value={selected} onValueChange={setSelected} className="h-96 w-full rounded-lg border">
      <ChatSidebar>
        <ChatSidebarHeader>
          <ChatSidebarTitle>
            <ChatSidebarHeading>Inbox</ChatSidebarHeading>
          </ChatSidebarTitle>
        </ChatSidebarHeader>
        <ChatConversationList>
          {Object.entries(threads).map(([id, t]) => (
            <ChatConversationItem key={id} value={id}>
              <Avatar>
                <AvatarFallback>{t.initials}</AvatarFallback>
              </Avatar>
              <ChatConversationInfo>
                <ChatConversationName>{t.name}</ChatConversationName>
                <ChatConversationPreview>{t.messages[t.messages.length - 1].text}</ChatConversationPreview>
              </ChatConversationInfo>
            </ChatConversationItem>
          ))}
        </ChatConversationList>
      </ChatSidebar>
      {thread && (
        <ChatPanel>
          <ChatHeader>
            <ChatHeaderInfo>
              <Avatar>
                <AvatarFallback>{thread.initials}</AvatarFallback>
              </Avatar>
              <ChatHeaderText>
                <ChatHeaderTitle>{thread.name}</ChatHeaderTitle>
              </ChatHeaderText>
            </ChatHeaderInfo>
          </ChatHeader>
          <ChatBody>
            <ChatMessages>
              {[...thread.messages].reverse().map((m, i) => (
                <ChatMessage key={i} variant={m.from === "me" ? "sent" : "received"}>
                  {m.text}
                  <ChatMessageTime>{m.time}</ChatMessageTime>
                </ChatMessage>
              ))}
            </ChatMessages>
            <ChatComposer onSubmit={send}>
              <ChatComposerField>
                <ChatComposerInput
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <ChatComposerSendTrigger />
              </ChatComposerField>
            </ChatComposer>
          </ChatBody>
        </ChatPanel>
      )}
    </Chat>
  )
}
