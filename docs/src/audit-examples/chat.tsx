import { MessagesSquareIcon, EllipsisIcon } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chat } from "@/components/ui/chat"

export default function Example() {
  const [details, setDetails] = useState(false)
  const [messages, setMessages] = useState(false)
  const [value, setValue] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [invalid, setInvalid] = useState(false)
  const [disabled, setDisabled] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <Button variant="outline" size="sm" aria-pressed={details} onClick={() => setDetails(!details)}>
        Conversation parts
      </Button>
      <Button variant="outline" size="sm" aria-pressed={messages} onClick={() => setMessages(!messages)}>
        Message parts
      </Button>
      {messages ? (
        <MessageParts />
      ) : details ? (
        <ConversationParts />
      ) : (
        <>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" aria-pressed={invalid} onClick={() => setInvalid(!invalid)}>
              Invalid
            </Button>
            <Button variant="outline" size="sm" aria-pressed={disabled} onClick={() => setDisabled(!disabled)}>
              Disabled
            </Button>
          </div>
          <Chat.Search
            data-audit-part="search-input"
            placeholder="Search conversations…"
            disabled={disabled}
            aria-invalid={invalid || undefined}
          />
          <Chat.Composer
            onSubmit={(event) => {
              event.preventDefault()
              if (value.trim()) {
                setSubmitted(value.trim())
                setValue("")
              }
            }}
          >
            <Chat.ComposerField data-audit-part="composer">
              <Chat.ComposerInput
                placeholder="Message…"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
              />
              <Chat.ComposerSendTrigger disabled={disabled} />
            </Chat.ComposerField>
          </Chat.Composer>
          <output>{submitted && `Sent: ${submitted}`}</output>
        </>
      )}
    </div>
  )
}

function ConversationParts() {
  const [selected, setSelected] = useState<string | null>("ava")
  const names = { ava: "Ava Chen", noah: "Noah Patel" }
  return (
    <Chat.Root value={selected} onValueChange={setSelected}>
      <div className="w-full space-y-4">
        <div role="list">
          {Object.entries(names).map(([id, name]) => (
            <Chat.ConversationItem value={id} key={id} aria-label={name} data-audit-part={id}>
              <Avatar.Root>
                <Avatar.Fallback>{id === "ava" ? "AC" : "NP"}</Avatar.Fallback>
              </Avatar.Root>
              <Chat.ConversationInfo>
                <Chat.ConversationName>{name}</Chat.ConversationName>
                <Chat.ConversationPreview>
                  {id === "ava" ? "Docs look great!" : "Can you review the latest changes?"}
                </Chat.ConversationPreview>
              </Chat.ConversationInfo>
            </Chat.ConversationItem>
          ))}
        </div>
        <Chat.Header data-audit-part="header">
          <Chat.HeaderInfo>
            <Avatar.Root>
              <Avatar.Fallback>{selected === "ava" ? "AC" : "NP"}</Avatar.Fallback>
            </Avatar.Root>
            <Chat.HeaderText>
              <Chat.HeaderTitle>{names[selected as keyof typeof names]}</Chat.HeaderTitle>
              <Chat.HeaderDescription>Available for review</Chat.HeaderDescription>
            </Chat.HeaderText>
          </Chat.HeaderInfo>
          <Chat.HeaderActions>
            <Button variant="ghost" size="icon" aria-label="Conversation actions">
              <EllipsisIcon />
            </Button>
          </Chat.HeaderActions>
        </Chat.Header>
        <Chat.EmptyContent data-audit-part="empty">
          <Chat.EmptyIcon>
            <MessagesSquareIcon />
          </Chat.EmptyIcon>
          <Chat.EmptyTitle>No conversation selected</Chat.EmptyTitle>
          <Chat.EmptyDescription>Choose a conversation to start chatting.</Chat.EmptyDescription>
        </Chat.EmptyContent>
      </div>
    </Chat.Root>
  )
}

function MessageParts() {
  const [rtl, setRtl] = useState(false)
  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
        RTL
      </Button>
      <section dir={rtl ? "rtl" : "ltr"} data-audit-case={rtl ? "rtl" : "ltr"}>
        <div className="flex min-w-0 flex-col gap-2">
          <Chat.Message data-audit-part="received">
            Docs look great! A longer message wraps across lines when space is limited.
          </Chat.Message>
          <Chat.Message data-audit-part="sent" variant="sent">
            Thanks, shipping today.
          </Chat.Message>
          <Chat.Message data-audit-part="unbroken">
            averylongunbrokentokenthatmuststayinsidethebubblewithoutoverflowingthemessageviewport
          </Chat.Message>
        </div>
      </section>
      <Chat.MessageTime data-audit-part="timestamp">9:12 AM · Delivered</Chat.MessageTime>
    </div>
  )
}
