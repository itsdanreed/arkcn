import * as React from "react"
import { ark } from "@ark-ui/react"
import { CornerDownRightIcon, PencilIcon, SendIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { formatRelativeTime } from "@/lib/time"
import { cn } from "@/lib/utils"
import { useControllable } from "@/lib/controllable"

/**
 * CommentThread — compositional, data-agnostic comments with replies,
 * reactions and a mentions composer. The consumer owns the comments and
 * the people list; the thread owns only which comment is being replied to or
 * edited. Mentions are plain text (`@Full Name`); `extractMentions` maps
 * them back to ids and `CommentBody` highlights them.
 *
 * Anatomy:
 *   CommentThread { people, currentUserId }
 *     CommentList > Comment value= authorId=
 *       CommentAvatar + CommentContent
 *         CommentHeader > CommentAuthor, CommentTime date=, CommentMeta
 *         CommentBody                      highlights @mentions
 *         CommentReactions > CommentReaction emoji= count= active=
 *         CommentActions > CommentReplyTrigger, CommentEditTrigger, …
 *       CommentReplies > Comment …          nested, with a guide line
 *     CommentComposer { people, onSubmit }
 *       CommentComposerReplyingTo          "Replying to X" strip
 *       CommentComposerInput               textarea; type @ to mention, ⌘↵ to send
 *       CommentComposerMentionList         suggestions under the input
 *       CommentComposerFooter > CommentComposerHint, CommentComposerCancelTrigger, CommentComposerSubmitTrigger
 */

type Person = { id: string; name: string; initials?: string; avatar?: string }

type ThreadContextValue = {
  /** People who can be mentioned and whose names and initials are rendered. */
  people: Person[]
  /** Id of the signed-in person; their comments get `data-own` and mentions of them `data-self`. */
  currentUserId?: string
  /** Id of the comment being replied to (controlled). */
  replyTo: string | null
  setReplyTo: (id: string | null) => void
  editing: string | null
  setEditing: (id: string | null) => void
}
const ThreadContext = React.createContext<ThreadContextValue | null>(null)
const CommentContext = React.createContext<{ value: string; authorId?: string; depth: number } | null>(null)

function useCommentThread() {
  const ctx = React.useContext(ThreadContext)
  if (!ctx) throw new Error("Comment parts must be used within <CommentThread>")
  return ctx
}
function useComment() {
  const ctx = React.useContext(CommentContext)
  if (!ctx) throw new Error("Comment parts must be used within <Comment>")
  return ctx
}

const initialsOf = (person?: Person) =>
  person?.initials ??
  (person?.name ?? "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

/* ---------------------------------------------------------------------------
 * Thread
 * ------------------------------------------------------------------------- */

function CommentThread({
  people = [],
  currentUserId,
  replyTo: replyToProp,
  onReplyToChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** People who can be mentioned and whose names and initials are rendered. */
  people?: Person[]
  /** Id of the signed-in person; their comments get `data-own` and mentions of them `data-self`. */
  currentUserId?: string
  /** Id of the comment being replied to (controlled). */
  replyTo?: string | null
  /** Called when the reply target changes. */
  onReplyToChange?: (id: string | null) => void
}) {
  const [replyTo, setReplyTo] = useControllable<string | null>(replyToProp, null, onReplyToChange)
  const [editing, setEditing] = React.useState<string | null>(null)
  const ctx = React.useMemo(
    () => ({ people, currentUserId, replyTo, setReplyTo, editing, setEditing }),
    [people, currentUserId, replyTo, setReplyTo, editing]
  )
  return (
    <ThreadContext.Provider value={ctx}>
      <div data-slot="comment-thread" className={cn("flex flex-col gap-4", className)} {...props} />
    </ThreadContext.Provider>
  )
}

function CommentList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="comment-list" className={cn("flex flex-col gap-4", className)} {...props} />
}

function Comment({
  value,
  authorId,
  className,
  ...props
}: React.ComponentProps<"li"> & { value: string; authorId?: string }) {
  const thread = useCommentThread()
  const parent = React.useContext(CommentContext)
  const depth = parent ? parent.depth + 1 : 0
  const ctx = React.useMemo(() => ({ value, authorId, depth }), [value, authorId, depth])
  return (
    <CommentContext.Provider value={ctx}>
      <li
        data-slot="comment"
        data-value={value}
        data-depth={depth}
        data-own={authorId && authorId === thread.currentUserId ? "" : undefined}
        data-replying={thread.replyTo === value ? "" : undefined}
        data-editing={thread.editing === value ? "" : undefined}
        className={cn("group/comment flex gap-3", className)}
        {...props}
      />
    </CommentContext.Provider>
  )
}

/** Avatar for the comment's author (from `people`), or pass your own children. */
function CommentAvatar({ className, children, ...props }: React.ComponentProps<typeof Avatar>) {
  const { people } = useCommentThread()
  const { authorId, depth } = useComment()
  const person = people.find((p) => p.id === authorId)
  return (
    <Avatar
      data-slot="comment-avatar"
      size={depth > 0 ? "sm" : "default"}
      className={cn("shrink-0", className)}
      {...props}
    >
      {children ?? (
        <>
          {person?.avatar && <AvatarImage src={person.avatar} alt="" />}
          <AvatarFallback>{initialsOf(person)}</AvatarFallback>
        </>
      )}
    </Avatar>
  )
}

function CommentContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="comment-content" className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />
}

function CommentHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="comment-header"
      className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm", className)}
      {...props}
    />
  )
}

/** Author name from `people` by default. */
function CommentAuthor({ className, children, ...props }: React.ComponentProps<"span">) {
  const { people } = useCommentThread()
  const { authorId } = useComment()
  return (
    <span data-slot="comment-author" className={cn("font-medium", className)} {...props}>
      {children ?? people.find((p) => p.id === authorId)?.name ?? "Unknown"}
    </span>
  )
}

function CommentTime({
  date,
  now,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"time">, "dateTime"> & { date: Date; now?: Date }) {
  return (
    <time
      data-slot="comment-time"
      dateTime={date.toISOString()}
      title={date.toLocaleString()}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {children ?? formatRelativeTime(date, { now })}
    </time>
  )
}

/** Small trailing note, e.g. "edited" or a role badge. */
function CommentMeta({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="comment-meta" className={cn("text-xs text-muted-foreground", className)} {...props} />
}

/** Split text into runs, turning `@Full Name` for known people into mention nodes. */
function renderMentions(text: string, people: Person[]) {
  if (!people.length || !text.includes("@")) return [text]
  const names = [...people].sort((a, b) => b.name.length - a.name.length)
  const pattern = new RegExp(
    `@(${names.map((p) => p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w])`,
    "g"
  )
  const nodes: React.ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    const person = people.find((p) => p.name === match[1])
    nodes.push(
      <CommentMention key={`${index}-${match[1]}`} personId={person?.id}>
        @{match[1]}
      </CommentMention>
    )
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

function CommentMention({ personId, className, ...props }: React.ComponentProps<"span"> & { personId?: string }) {
  const { currentUserId } = useCommentThread()
  return (
    <span
      data-slot="comment-mention"
      data-person={personId}
      data-self={personId && personId === currentUserId ? "" : undefined}
      className={cn(
        "rounded-sm bg-primary/10 px-1 font-medium text-primary data-self:bg-amber-500/20 data-self:text-amber-700 dark:data-self:text-amber-300",
        className
      )}
      {...props}
    />
  )
}

/** Plain text with mentions highlighted; pass `children` to render anything else. */
function CommentBody({ text, className, children, ...props }: React.ComponentProps<"div"> & { text?: string }) {
  const { people } = useCommentThread()
  return (
    <div
      data-slot="comment-body"
      className={cn("text-sm/relaxed wrap-break-word whitespace-pre-wrap", className)}
      {...props}
    >
      {children ?? (text !== undefined ? renderMentions(text, people) : null)}
    </div>
  )
}

function CommentReactions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="comment-reactions"
      className={cn("flex flex-wrap items-center gap-1 pt-0.5", className)}
      {...props}
    />
  )
}

function CommentReaction({
  emoji,
  count = 0,
  active = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ark.button> & { emoji: string; count?: number; active?: boolean }) {
  return (
    <ark.button
      type="button"
      data-slot="comment-reaction"
      data-active={active ? "" : undefined}
      aria-pressed={active}
      aria-label={`${emoji} ${count}`}
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border bg-background px-1.5 text-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none data-active:border-primary/40 data-active:bg-primary/10",
        className
      )}
      {...props}
    >
      <span aria-hidden>{emoji}</span>
      {children ?? <span className="tabular-nums">{count}</span>}
    </ark.button>
  )
}

/** Row of small text buttons; revealed on hover/focus, always visible when the comment is active. */
function CommentActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="comment-actions"
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-focus-within/comment:opacity-100 group-hover/comment:opacity-100 group-data-editing/comment:opacity-100 group-data-replying/comment:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function CommentReplyTrigger({ asChild, children, onClick, className, ...props }: React.ComponentProps<typeof Button>) {
  const { replyTo, setReplyTo } = useCommentThread()
  const { value } = useComment()
  return (
    <Button
      data-slot="comment-reply-trigger"
      variant="ghost"
      size="xs"
      asChild={asChild}
      aria-pressed={replyTo === value}
      className={cn("h-6 px-1.5 text-xs", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setReplyTo(replyTo === value ? null : value)
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <CornerDownRightIcon /> Reply
            </>
          ))}
    </Button>
  )
}

function CommentEditTrigger({ asChild, children, onClick, className, ...props }: React.ComponentProps<typeof Button>) {
  const { editing, setEditing } = useCommentThread()
  const { value } = useComment()
  return (
    <Button
      data-slot="comment-edit-trigger"
      variant="ghost"
      size="xs"
      asChild={asChild}
      aria-pressed={editing === value}
      className={cn("h-6 px-1.5 text-xs", className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setEditing(editing === value ? null : value)
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <PencilIcon /> Edit
            </>
          ))}
    </Button>
  )
}

/** Nested replies with a guide line; put `Comment`s inside. */
function CommentReplies({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol data-slot="comment-replies" className={cn("mt-2 flex flex-col gap-3 border-s-2 ps-3", className)} {...props} />
  )
}

function CommentEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="comment-empty"
      className={cn("rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/* ---------------------------------------------------------------------------
 * Composer with mentions
 * ------------------------------------------------------------------------- */

type MentionState = { query: string; start: number; index: number } | null

type ComposerContextValue = {
  /** People who can be mentioned and whose names and initials are rendered. */
  people: Person[]
  value: string
  setValue: (value: string) => void
  mention: MentionState
  setMention: (mention: MentionState) => void
  suggestions: Person[]
  pick: (person: Person) => void
  /** The input registers how a pick is applied to its DOM. */
  registerPicker: (fn: (person: Person, mention: NonNullable<MentionState>) => void) => () => void
  submit: () => void
  cancel: () => void
  canSubmit: boolean
  inputRef: React.RefObject<HTMLDivElement | null>
  listId: string
}
const ComposerContext = React.createContext<ComposerContextValue | null>(null)
function useComposer() {
  const ctx = React.useContext(ComposerContext)
  if (!ctx) throw new Error("Composer parts must be used within <CommentComposer>")
  return ctx
}

/** Ids of people whose `@Full Name` appears in the text. */
function extractMentions(text: string, people: Person[]) {
  return people
    .filter((p) => new RegExp(`@${p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w])`).test(text))
    .map((p) => p.id)
}

function CommentComposer({
  people = [],
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onCancel,
  maxSuggestions = 6,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "onSubmit" | "defaultValue"> & {
  /** People who can be mentioned and whose names and initials are rendered. */
  people?: Person[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called with the trimmed text and the ids of mentioned people. */
  onSubmit?: (comment: { text: string; mentions: string[] }) => void
  /** Called when the composer is cancelled with Escape or the cancel trigger. */
  onCancel?: () => void
  /** Maximum number of mention suggestions shown. */
  maxSuggestions?: number
}) {
  const [value, setValue] = useControllable(valueProp, defaultValue, onValueChange)
  const [mention, setMention] = React.useState<MentionState>(null)
  const inputRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()
  const pickerRef = React.useRef<((person: Person, mention: NonNullable<MentionState>) => void) | null>(null)
  const registerPicker = React.useCallback((fn: (person: Person, mention: NonNullable<MentionState>) => void) => {
    pickerRef.current = fn
    return () => {
      if (pickerRef.current === fn) pickerRef.current = null
    }
  }, [])

  const suggestions = React.useMemo(() => {
    if (!mention) return []
    const q = mention.query.toLowerCase()
    return people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, maxSuggestions)
  }, [mention, people, maxSuggestions])

  const pick = React.useCallback(
    (person: Person) => {
      if (!mention) return
      pickerRef.current?.(person, mention)
      setMention(null)
    },
    [mention]
  )

  const canSubmit = value.trim().length > 0
  const submit = React.useCallback(() => {
    if (!canSubmit) return
    onSubmit?.({ text: value.trim(), mentions: extractMentions(value, people) })
    setValue("")
    setMention(null)
  }, [canSubmit, onSubmit, value, people, setValue])
  const cancel = React.useCallback(() => {
    setValue("")
    setMention(null)
    onCancel?.()
  }, [setValue, onCancel])

  const ctx = React.useMemo<ComposerContextValue>(
    () => ({
      people,
      value,
      setValue,
      mention,
      setMention,
      suggestions,
      pick,
      registerPicker,
      submit,
      cancel,
      canSubmit,
      inputRef,
      listId,
    }),
    [people, value, setValue, mention, suggestions, pick, registerPicker, submit, cancel, canSubmit, listId]
  )

  return (
    <ComposerContext.Provider value={ctx}>
      <div
        data-slot="comment-composer"
        data-mentioning={mention ? "" : undefined}
        className={cn(
          "relative flex flex-col gap-2 rounded-xl border bg-background p-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ComposerContext.Provider>
  )
}

/** "Replying to …" strip; renders nothing when not replying. The render prop gets the comment id. */
function CommentComposerReplyingTo({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { children?: (details: { id: string }) => React.ReactNode }) {
  const { replyTo, setReplyTo } = useCommentThread()
  if (!replyTo) return null
  return (
    <div
      data-slot="comment-composer-replying-to"
      className={cn("flex items-center gap-2 px-1 text-xs text-muted-foreground", className)}
      {...props}
    >
      <CornerDownRightIcon className="size-3.5" />
      {children ? children({ id: replyTo }) : <span>Replying to a comment</span>}
      <Button variant="ghost" size="xs" className="ms-auto h-5 px-1.5" onClick={() => setReplyTo(null)}>
        Cancel
      </Button>
    </div>
  )
}

/* ----- contenteditable helpers ----- */

const CHIP = "comment-mention-chip"
const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** Serialise the editable DOM to plain text; chips become `@Full Name`, blocks and <br> become newlines. */
function serialize(root: HTMLElement): string {
  let out = ""
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += (node.textContent ?? "").replace(/ /g, " ")
      return
    }
    if (!(node instanceof HTMLElement)) return
    if (node.dataset.slot === CHIP) {
      out += `@${node.dataset.name ?? ""}`
      return
    }
    if (node.tagName === "BR") {
      out += "\n"
      return
    }
    const block = node.tagName === "DIV" || node.tagName === "P"
    if (block && out.length && !out.endsWith("\n")) out += "\n"
    node.childNodes.forEach(walk)
  }
  root.childNodes.forEach(walk)
  return out.replace(/\n$/, "")
}

function createChip(person: Person) {
  const chip = document.createElement("span")
  chip.dataset.slot = CHIP
  chip.dataset.person = person.id
  chip.dataset.name = person.name
  chip.contentEditable = "false"
  chip.className =
    "mx-px inline-flex items-center rounded-full bg-muted px-1.5 py-px align-baseline text-[0.9em] font-medium text-foreground select-none"
  chip.textContent = `@${person.name}`
  return chip
}

/** Build editable DOM from plain text, turning known `@Full Name`s into chips. */
function hydrate(root: HTMLElement, text: string, people: Person[]) {
  root.replaceChildren()
  const names = [...people].sort((a, b) => b.name.length - a.name.length)
  const pattern = names.length ? new RegExp(`@(${names.map((p) => escapeRe(p.name)).join("|")})(?![\\w])`, "g") : null
  text.split("\n").forEach((line, lineIndex) => {
    if (lineIndex > 0) root.appendChild(document.createElement("br"))
    let last = 0
    if (pattern) {
      for (const match of line.matchAll(pattern)) {
        const index = match.index ?? 0
        if (index > last) root.appendChild(document.createTextNode(line.slice(last, index)))
        const person = people.find((p) => p.name === match[1])
        if (person) root.appendChild(createChip(person))
        last = index + match[0].length
      }
    }
    if (last < line.length) root.appendChild(document.createTextNode(line.slice(last)))
  })
}

/** The `@query` immediately before the caret inside a text node, if any. */
function mentionAtCaret(root: HTMLElement): { node: Text; start: number; end: number; query: string } | null {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount || !selection.isCollapsed) return null
  const range = selection.getRangeAt(0)
  const node = range.startContainer
  if (node.nodeType !== Node.TEXT_NODE || !root.contains(node)) return null
  const text = node.textContent ?? ""
  const caret = range.startOffset
  const before = text.slice(0, caret)
  const at = before.lastIndexOf("@")
  if (at === -1) return null
  if (at > 0 && /\S/.test(before[at - 1])) return null
  const query = before.slice(at + 1)
  if (query.length > 30) return null
  return { node: node as Text, start: at, end: caret, query }
}

function placeCaretAfter(node: Node) {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.setStartAfter(node)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

/**
 * Contenteditable input: picked mentions become atomic grey chips (one
 * Backspace removes a whole chip); `value` stays plain `@Full Name` text.
 * Arrows/Enter/Tab pick from the list, Escape closes it, ⌘/Ctrl+Enter submits.
 */
function CommentComposerInput({
  className,
  placeholder = "Write a comment…",
  autoFocus,
  onKeyDown,
  onBlur,
  onInput,
  onPaste,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & { placeholder?: string; autoFocus?: boolean }) {
  const c = useComposer()
  const lastSerialized = React.useRef<string | null>(null)

  // Reflect outside changes to `value` (initial text, edits, reset after submit) without disturbing typing.
  React.useLayoutEffect(() => {
    const el = c.inputRef.current
    if (!el || c.value === lastSerialized.current) return
    hydrate(el, c.value, c.people)
    lastSerialized.current = c.value
  }, [c.value, c.people, c.inputRef])

  React.useEffect(() => {
    if (autoFocus) c.inputRef.current?.focus()
  }, [autoFocus, c.inputRef])

  const { registerPicker, setValue, inputRef } = c
  React.useEffect(
    () =>
      registerPicker((person) => {
        const el = inputRef.current
        if (!el) return
        const hit = mentionAtCaret(el)
        const chip = createChip(person)
        const space = document.createTextNode(" ")
        if (hit) {
          const range = document.createRange()
          range.setStart(hit.node, hit.start)
          range.setEnd(hit.node, hit.end)
          range.deleteContents()
          range.insertNode(space)
          range.insertNode(chip)
        } else {
          el.append(chip, space)
        }
        placeCaretAfter(space)
        el.focus()
        const next = serialize(el)
        lastSerialized.current = next
        setValue(next)
      }),
    [registerPicker, inputRef, setValue]
  )

  const sync = () => {
    const el = c.inputRef.current
    if (!el) return
    if (el.innerHTML === "<br>") el.replaceChildren()
    const next = serialize(el)
    lastSerialized.current = next
    c.setValue(next)
    const hit = mentionAtCaret(el)
    c.setMention(hit ? { query: hit.query, start: hit.start, index: 0 } : null)
  }

  return (
    <div
      ref={c.inputRef}
      data-slot="comment-composer-input"
      role={c.mention ? "combobox" : "textbox"}
      contentEditable
      suppressContentEditableWarning
      aria-multiline={c.mention ? undefined : true}
      aria-expanded={c.mention ? true : undefined}
      aria-controls={c.mention ? c.listId : undefined}
      aria-autocomplete={c.mention ? "list" : undefined}
      aria-activedescendant={
        c.mention && c.suggestions[c.mention.index] ? `${c.listId}-${c.suggestions[c.mention.index].id}` : undefined
      }
      data-placeholder={placeholder}
      className={cn(
        "min-h-20 px-2 py-1.5 text-sm wrap-break-word whitespace-pre-wrap outline-none",
        "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        className
      )}
      onInput={(event) => {
        onInput?.(event)
        sync()
      }}
      onKeyUp={(event) => {
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) sync()
      }}
      onClick={() => sync()}
      onPaste={(event) => {
        onPaste?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        document.execCommand("insertText", false, event.clipboardData.getData("text/plain"))
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault()
          c.submit()
          return
        }
        if (!c.mention) {
          if (event.key === "Escape") c.cancel()
          return
        }
        const count = c.suggestions.length
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault()
          if (!count) return
          const delta = event.key === "ArrowDown" ? 1 : -1
          c.setMention({ ...c.mention, index: (c.mention.index + delta + count) % count })
        } else if ((event.key === "Enter" || event.key === "Tab") && count) {
          event.preventDefault()
          c.pick(c.suggestions[c.mention.index])
        } else if (event.key === "Escape") {
          event.preventDefault()
          c.setMention(null)
        }
      }}
      onBlur={(event) => {
        onBlur?.(event)
        setTimeout(() => {
          if (document.activeElement !== event.target) c.setMention(null)
        }, 120)
      }}
      {...props}
    />
  )
}

/** Floating suggestion list anchored under the input while an `@query` is active. Focus stays in the textarea. */
function CommentComposerMentionList({ className, ...props }: React.ComponentProps<typeof PopoverContent>) {
  const c = useComposer()
  const open = !!c.mention
  return (
    <Popover
      open={open}
      onOpenChange={({ open }) => {
        if (!open) c.setMention(null)
      }}
      autoFocus={false}
      modal={false}
      positioning={{
        placement: "bottom-start",
        sameWidth: true,
        gutter: 4,
        getAnchorRect: () => {
          const rect = c.inputRef.current?.getBoundingClientRect()
          return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null
        },
      }}
    >
      <PopoverContent
        id={c.listId}
        role="listbox"
        aria-label="People"
        data-slot="comment-composer-mention-list"
        className={cn("max-h-56 w-auto overflow-y-auto p-1", className)}
        onPointerDown={(event) => event.preventDefault()}
        {...props}
      >
        {c.suggestions.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No one matches "{c.mention?.query}"</div>
        ) : (
          c.suggestions.map((person, index) => (
            <div
              key={person.id}
              id={`${c.listId}-${person.id}`}
              role="option"
              aria-selected={index === c.mention?.index}
              data-slot="comment-composer-mention-item"
              data-highlighted={index === c.mention?.index ? "" : undefined}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              onMouseEnter={() => c.mention && c.setMention({ ...c.mention, index })}
              onClick={() => c.pick(person)}
            >
              <Avatar size="sm" className="size-6 text-[10px]">
                {person.avatar && <AvatarImage src={person.avatar} alt="" />}
                <AvatarFallback>{initialsOf(person)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{person.name}</span>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}

function CommentComposerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="comment-composer-footer" className={cn("flex items-center gap-2 px-1", className)} {...props} />
  )
}

function CommentComposerHint({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="comment-composer-hint"
      className={cn("me-auto text-xs text-muted-foreground", className)}
      {...props}
    >
      {children ?? (
        <>
          <Kbd>@</Kbd> to mention · <Kbd>⌘↵</Kbd> to send
        </>
      )}
    </span>
  )
}

function CommentComposerSubmitTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { submit, canSubmit } = useComposer()
  return (
    <Button
      data-slot="comment-composer-submit-trigger"
      size="sm"
      asChild={asChild}
      disabled={!canSubmit}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) submit()
      }}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <SendIcon /> Comment
            </>
          ))}
    </Button>
  )
}

function CommentComposerCancelTrigger({ asChild, children, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { cancel } = useComposer()
  return (
    <Button
      data-slot="comment-composer-cancel-trigger"
      variant="ghost"
      size="sm"
      asChild={asChild}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) cancel()
      }}
      {...props}
    >
      {asChild ? children : (children ?? "Cancel")}
    </Button>
  )
}

export {
  CommentThread,
  CommentList,
  Comment,
  CommentAvatar,
  CommentContent,
  CommentHeader,
  CommentAuthor,
  CommentTime,
  CommentMeta,
  CommentBody,
  CommentMention,
  CommentReactions,
  CommentReaction,
  CommentActions,
  CommentReplyTrigger,
  CommentEditTrigger,
  CommentReplies,
  CommentEmpty,
  CommentComposer,
  CommentComposerReplyingTo,
  CommentComposerInput,
  CommentComposerMentionList,
  CommentComposerFooter,
  CommentComposerHint,
  CommentComposerSubmitTrigger,
  CommentComposerCancelTrigger,
  useCommentThread,
  useComment,
  extractMentions,
  renderMentions,
  type Person as CommentPerson,
}
