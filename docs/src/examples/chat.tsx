import * as React from "react"
import { Avatar } from "@/components/ui/avatar"
import { Chat } from "@/components/ui/chat"

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
    <Chat.Root value={selected} onValueChange={setSelected} className="h-96 w-full rounded-lg border">
      <Chat.Sidebar>
        <Chat.SidebarHeader>
          <Chat.SidebarTitle>
            <Chat.SidebarHeading>Inbox</Chat.SidebarHeading>
          </Chat.SidebarTitle>
        </Chat.SidebarHeader>
        <Chat.ConversationList>
          {Object.entries(threads).map(([id, t]) => (
            <Chat.ConversationItem key={id} value={id}>
              <Avatar.Root>
                <Avatar.Fallback>{t.initials}</Avatar.Fallback>
              </Avatar.Root>
              <Chat.ConversationInfo>
                <Chat.ConversationName>{t.name}</Chat.ConversationName>
                <Chat.ConversationPreview>{t.messages[t.messages.length - 1].text}</Chat.ConversationPreview>
              </Chat.ConversationInfo>
            </Chat.ConversationItem>
          ))}
        </Chat.ConversationList>
      </Chat.Sidebar>
      {thread && (
        <Chat.Panel>
          <Chat.Header>
            <Chat.BackTrigger />
            <Chat.HeaderInfo>
              <Avatar.Root>
                <Avatar.Fallback>{thread.initials}</Avatar.Fallback>
              </Avatar.Root>
              <Chat.HeaderText>
                <Chat.HeaderTitle>{thread.name}</Chat.HeaderTitle>
              </Chat.HeaderText>
            </Chat.HeaderInfo>
          </Chat.Header>
          <Chat.Body>
            <Chat.Messages>
              {[...thread.messages].reverse().map((m, i) => (
                <Chat.Message key={i} variant={m.from === "me" ? "sent" : "received"}>
                  {m.text}
                  <Chat.MessageTime>{m.time}</Chat.MessageTime>
                </Chat.Message>
              ))}
            </Chat.Messages>
            <Chat.Composer onSubmit={send}>
              <Chat.ComposerField>
                <Chat.ComposerInput
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Chat.ComposerSendTrigger />
              </Chat.ComposerField>
            </Chat.Composer>
          </Chat.Body>
        </Chat.Panel>
      )}
    </Chat.Root>
  )
}
