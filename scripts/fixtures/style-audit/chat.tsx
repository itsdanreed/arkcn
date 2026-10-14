import { Bubble, BubbleContent, BubbleGroup } from "../ui/bubble"
import { MessageFooter } from "../ui/message"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from "../ui/item"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "../ui/empty"
import { useState } from "react"
import { SearchIcon, SendIcon, MessagesSquareIcon, EllipsisIcon } from "lucide-react"
import { Button } from "../ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../ui/input-group"

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
          <InputGroup data-audit-part="search">
            <InputGroupInput
              aria-label="Search"
              placeholder="Search conversations…"
              disabled={disabled}
              aria-invalid={invalid || undefined}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (value.trim()) {
                setSubmitted(value.trim())
                setValue("")
              }
            }}
          >
            <InputGroup data-audit-part="composer">
              <InputGroupInput
                aria-label="Message"
                placeholder="Message…"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" type="submit" aria-label="Send" disabled={disabled}>
                  <SendIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
          <output>{submitted && `Sent: ${submitted}`}</output>
        </>
      )}
    </div>
  )
}

function ConversationParts() {
  const [selected, setSelected] = useState("ava")
  const names = { ava: "Ava Chen", noah: "Noah Patel" }
  return (
    <div className="w-full space-y-4">
      <div role="list">
        {Object.entries(names).map(([id, name]) => (
          <div role="listitem" className="py-1" key={id}>
            <Item
              variant={selected === id ? "muted" : "default"}
              render={<button type="button" />}
              onClick={() => setSelected(id)}
              aria-current={selected === id ? "true" : undefined}
              aria-label={name}
              data-audit-part={id}
            >
              <Avatar>
                <AvatarFallback>{id === "ava" ? "AC" : "NP"}</AvatarFallback>
              </Avatar>
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
                <ItemDescription>
                  {id === "ava" ? "Docs look great!" : "Can you review the latest changes?"}
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>
        ))}
      </div>
      <Item data-audit-part="header">
        <Avatar>
          <AvatarFallback>{selected === "ava" ? "AC" : "NP"}</AvatarFallback>
        </Avatar>
        <ItemContent>
          <ItemTitle>{names[selected as keyof typeof names]}</ItemTitle>
          <ItemDescription>Available for review</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon" aria-label="Conversation actions">
            <EllipsisIcon />
          </Button>
        </ItemActions>
      </Item>
      <Empty data-audit-part="empty">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessagesSquareIcon />
          </EmptyMedia>
          <EmptyTitle>No conversation selected</EmptyTitle>
          <EmptyDescription>Choose a conversation to start chatting.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
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
        <BubbleGroup>
          <Bubble variant="muted">
            <BubbleContent data-audit-part="received">
              Docs look great! A longer message wraps across lines when space is limited.
            </BubbleContent>
          </Bubble>
          <Bubble align="end">
            <BubbleContent data-audit-part="sent">Thanks, shipping today.</BubbleContent>
          </Bubble>
          <Bubble variant="muted">
            <BubbleContent data-audit-part="unbroken">
              averylongunbrokentokenthatmuststayinsidethebubblewithoutoverflowingthemessageviewport
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
      </section>
      <MessageFooter data-audit-part="timestamp">9:12 AM · Delivered</MessageFooter>
    </div>
  )
}
