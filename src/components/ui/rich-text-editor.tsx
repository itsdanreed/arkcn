import * as React from "react"
import { ark } from "@ark-ui/react"
import { createListCollection } from "@ark-ui/react/collection"
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TableKit } from "@tiptap/extension-table"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type Extensions,
  type JSONContent,
  type UseEditorOptions,
} from "@tiptap/react"
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus"
import { StarterKit } from "@tiptap/starter-kit"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SquareCodeIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Popover } from "@/components/ui/popover"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * RichTextEditor — compositional editor parts on tiptap. The root owns the
 * tiptap `Editor` (content is controllable as HTML) and reports changes as
 * `onChange({ html, json, text })`. Every toolbar control is its own part and
 * reads the editor from context, so a consumer composes exactly the toolbar
 * it wants; `RichTextEditorToggle name="bold"` covers the common actions and
 * `isActive`/`onToggle` take over for custom ones.
 *
 * Anatomy:
 *   RichTextEditor { content, onChange, placeholder, editable }
 *     RichTextEditorToolbar > ToolbarGroup > Toggle name=… / Trigger name=… / BlockSelect / LinkTrigger / ImageTrigger
 *     RichTextEditorContent            the prose area
 *     RichTextEditorBubbleMenu         selection toolbar (same toggles)
 *     RichTextEditorFooter > RichTextEditorCharacterCount
 */

type RichTextChange = { html: string; json: JSONContent; text: string }

type RichTextEditorContextValue = { editor: Editor | null; editable: boolean }
const RichTextEditorContext = React.createContext<RichTextEditorContextValue | null>(null)

function useRichTextEditor() {
  const ctx = React.useContext(RichTextEditorContext)
  if (!ctx) throw new Error("RichTextEditor parts must be used within <RichTextEditor>")
  return ctx
}

/* ---------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

function RichTextEditorRoot({
  content,
  defaultContent = "",
  onChange,
  placeholder = "Write something…",
  editable = true,
  autofocus = false,
  extensions = [],
  characterLimit,
  editorOptions,
  className,
  children,
  ...props
}: RichTextEditorRootProps) {
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: characterLimit }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false }),
      TableKit.configure({ table: { resizable: false } }),
      ...extensions,
    ],
    content: content ?? defaultContent,
    editable,
    autofocus,
    editorProps: {
      attributes: { class: "outline-none" },
      ...editorOptions?.editorProps,
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current?.({ html: editor.getHTML(), json: editor.getJSON(), text: editor.getText() })
      editorOptions?.onUpdate?.({ editor, transaction: editor.state.tr, appendedTransactions: [] })
    },
    ...editorOptions,
  })

  // Controlled content: replace the document only when the outside value actually differs.
  React.useEffect(() => {
    if (!editor || content === undefined) return
    if (content !== editor.getHTML()) editor.commands.setContent(content, { emitUpdate: false })
  }, [editor, content])

  React.useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable)
  }, [editor, editable])

  const ctx = React.useMemo(() => ({ editor, editable }), [editor, editable])

  return (
    <RichTextEditorContext.Provider value={ctx}>
      <ark.div
        data-slot="rich-text-editor"
        data-editable={editable ? "" : undefined}
        className={cn(
          "flex min-h-0 flex-col rounded-xl border bg-background text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-focus-visible:border-ring",
          className
        )}
        {...props}
      >
        {children}
      </ark.div>
    </RichTextEditorContext.Provider>
  )
}

/* ---------------------------------------------------------------------------
 * Actions registry
 * ------------------------------------------------------------------------- */

type ActionDef = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Keyboard shortcut shown in the tooltip. */
  shortcut?: string
  /** Whether the toggle is pressed. */
  isActive?: (editor: Editor) => boolean
  /** Whether the action can run right now; disables the control when false. */
  canRun?: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const chain = (editor: Editor) => editor.chain().focus()

const actions = {
  bold: {
    label: "Bold",
    icon: BoldIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘B",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("bold"),
    run: (e) => chain(e).toggleBold().run(),
  },
  italic: {
    label: "Italic",
    icon: ItalicIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘I",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("italic"),
    run: (e) => chain(e).toggleItalic().run(),
  },
  underline: {
    label: "Underline",
    icon: UnderlineIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘U",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("underline"),
    run: (e) => chain(e).toggleUnderline().run(),
  },
  strike: {
    label: "Strikethrough",
    icon: StrikethroughIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧S",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("strike"),
    run: (e) => chain(e).toggleStrike().run(),
  },
  code: {
    label: "Inline code",
    icon: CodeIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘E",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("code"),
    run: (e) => chain(e).toggleCode().run(),
  },
  highlight: {
    label: "Highlight",
    icon: HighlighterIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧H",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("highlight"),
    run: (e) => chain(e).toggleHighlight().run(),
  },
  paragraph: {
    label: "Paragraph",
    icon: PilcrowIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⌥0",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("paragraph"),
    run: (e) => chain(e).setParagraph().run(),
  },
  heading1: {
    label: "Heading 1",
    icon: Heading1Icon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⌥1",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("heading", { level: 1 }),
    run: (e) => chain(e).toggleHeading({ level: 1 }).run(),
  },
  heading2: {
    label: "Heading 2",
    icon: Heading2Icon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⌥2",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => chain(e).toggleHeading({ level: 2 }).run(),
  },
  heading3: {
    label: "Heading 3",
    icon: Heading3Icon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⌥3",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => chain(e).toggleHeading({ level: 3 }).run(),
  },
  bulletList: {
    label: "Bullet list",
    icon: ListIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧8",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => chain(e).toggleBulletList().run(),
  },
  orderedList: {
    label: "Numbered list",
    icon: ListOrderedIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧7",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => chain(e).toggleOrderedList().run(),
  },
  taskList: {
    label: "Task list",
    icon: ListChecksIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧9",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("taskList"),
    run: (e) => chain(e).toggleTaskList().run(),
  },
  blockquote: {
    label: "Quote",
    icon: QuoteIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧B",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => chain(e).toggleBlockquote().run(),
  },
  codeBlock: {
    label: "Code block",
    icon: SquareCodeIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⌥C",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("codeBlock"),
    run: (e) => chain(e).toggleCodeBlock().run(),
  },
  alignLeft: {
    label: "Align left",
    icon: AlignLeftIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧L",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive({ textAlign: "left" }),
    run: (e) => chain(e).setTextAlign("left").run(),
  },
  alignCenter: {
    label: "Align center",
    icon: AlignCenterIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧E",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive({ textAlign: "center" }),
    run: (e) => chain(e).setTextAlign("center").run(),
  },
  alignRight: {
    label: "Align right",
    icon: AlignRightIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧R",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive({ textAlign: "right" }),
    run: (e) => chain(e).setTextAlign("right").run(),
  },
  alignJustify: {
    label: "Justify",
    icon: AlignJustifyIcon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧J",
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive({ textAlign: "justify" }),
    run: (e) => chain(e).setTextAlign("justify").run(),
  },
  horizontalRule: { label: "Divider", icon: MinusIcon, run: (e) => chain(e).setHorizontalRule().run() },
  clearFormatting: {
    label: "Clear formatting",
    icon: RemoveFormattingIcon,
    run: (e) => chain(e).unsetAllMarks().clearNodes().run(),
  },
  undo: {
    label: "Undo",
    icon: Undo2Icon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘Z",
    /** Whether the action can run right now; disables the control when false. */
    canRun: (e) => e.can().undo(),
    run: (e) => chain(e).undo().run(),
  },
  redo: {
    label: "Redo",
    icon: Redo2Icon,
    /** Keyboard shortcut shown in the tooltip. */
    shortcut: "⌘⇧Z",
    /** Whether the action can run right now; disables the control when false. */
    canRun: (e) => e.can().redo(),
    run: (e) => chain(e).redo().run(),
  },
  unsetLink: {
    label: "Remove link",
    icon: UnlinkIcon,
    /** Whether the toggle is pressed. */
    isActive: (e) => e.isActive("link"),
    /** Whether the action can run right now; disables the control when false. */
    canRun: (e) => e.isActive("link"),
    run: (e) => chain(e).unsetLink().run(),
  },
  insertTable: {
    label: "Insert table",
    icon: TableIcon,
    run: (e) => chain(e).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
} satisfies Record<string, ActionDef>

type ActionName = keyof typeof actions

/** Subscribe to the bits of editor state a control needs; re-renders on selection and doc changes. */
function useActionState(isActive?: (e: Editor) => boolean, canRun?: (e: Editor) => boolean) {
  const { editor, editable } = useRichTextEditor()
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      active: !!editor && !!isActive?.(editor),
      enabled: !!editor && editable && (canRun ? canRun(editor) : true),
    }),
  })
  return state ?? { active: false, enabled: false }
}

/* ---------------------------------------------------------------------------
 * Toolbar
 * ------------------------------------------------------------------------- */

function RichTextEditorToolbar({ className, onKeyDown, ...props }: RichTextEditorToolbarProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <ark.div
      ref={ref}
      data-slot="rich-text-editor-toolbar"
      role="toolbar"
      aria-label="Formatting"
      className={cn("flex flex-wrap items-center gap-1 border-b p-1.5", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
        const buttons = Array.from(ref.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [])
        const index = buttons.indexOf(document.activeElement as HTMLElement)
        if (index === -1) return
        event.preventDefault()
        const next =
          event.key === "ArrowRight" ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length
        buttons[next]?.focus()
      }}
      {...props}
    />
  )
}

function RichTextEditorToolbarGroup({ className, ...props }: RichTextEditorToolbarGroupProps) {
  return (
    <ark.div
      data-slot="rich-text-editor-toolbar-group"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function RichTextEditorToolbarSeparator({ className, ...props }: RichTextEditorToolbarSeparatorProps) {
  return (
    <Separator.Root
      data-slot="rich-text-editor-toolbar-separator"
      orientation="vertical"
      className={cn("mx-1 h-5!", className)}
      {...props}
    />
  )
}

function ControlTooltip({
  label,
  shortcut,
  children,
}: {
  label: React.ReactNode
  /** Keyboard shortcut shown in the tooltip. */
  shortcut?: string
  children: React.ReactElement
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Content>
        {label}
        {shortcut && <Kbd.Root className="ms-1.5">{shortcut}</Kbd.Root>}
      </Tooltip.Content>
    </Tooltip.Root>
  )
}

type ControlProps = {
  /** A built-in action; supplies icon, label, shortcut and behaviour. */
  name?: ActionName
  label?: string
  /** Keyboard shortcut shown in the tooltip. */
  shortcut?: string
  /** Whether the toggle is pressed. */
  isActive?: (editor: Editor) => boolean
  /** Whether the action can run right now; disables the control when false. */
  canRun?: (editor: Editor) => boolean
  onToggle?: (editor: Editor) => void
  tooltip?: boolean
}

/** A pressed/unpressed formatting control (marks, lists, alignment, block types). */
function RichTextEditorToggle({
  name,
  label,
  shortcut,
  isActive,
  canRun,
  onToggle,
  tooltip = true,
  className,
  children,
  asChild,
  ...props
}: RichTextEditorToggleProps) {
  const { editor } = useRichTextEditor()
  const def: ActionDef | undefined = name ? actions[name] : undefined
  const activeFn = isActive ?? def?.isActive
  const canFn = canRun ?? def?.canRun
  const { active, enabled } = useActionState(activeFn, canFn)
  const text = label ?? def?.label ?? name ?? ""
  const Icon = def?.icon
  const control = (
    <Toggle.Root
      data-slot="rich-text-editor-toggle"
      data-action={name}
      size="sm"
      aria-label={text}
      pressed={active}
      disabled={!enabled}
      asChild={asChild}
      className={cn("size-7 px-0", className)}
      onPressedChange={() => {
        if (!editor) return
        if (onToggle) onToggle(editor)
        else def?.run(editor)
      }}
      {...props}
    >
      {asChild ? children : (children ?? (Icon ? <Icon /> : text))}
    </Toggle.Root>
  )
  return tooltip ? (
    <ControlTooltip label={text} shortcut={shortcut ?? def?.shortcut}>
      {control}
    </ControlTooltip>
  ) : (
    control
  )
}

/** A one-shot action (undo, redo, divider, clear formatting, insert table). */
function RichTextEditorTrigger({
  name,
  label,
  shortcut,
  canRun,
  onToggle,
  tooltip = true,
  className,
  children,
  asChild,
  onClick,
  ...props
}: RichTextEditorTriggerProps) {
  const { editor } = useRichTextEditor()
  const def: ActionDef | undefined = name ? actions[name] : undefined
  const { enabled } = useActionState(undefined, canRun ?? def?.canRun)
  const text = label ?? def?.label ?? name ?? ""
  const Icon = def?.icon
  const control = (
    <Button
      data-slot="rich-text-editor-trigger"
      data-action={name}
      variant="ghost"
      size="icon-sm"
      aria-label={text}
      disabled={!enabled}
      asChild={asChild}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || !editor) return
        if (onToggle) onToggle(editor)
        else def?.run(editor)
      }}
      {...props}
    >
      {asChild ? children : (children ?? (Icon ? <Icon /> : text))}
    </Button>
  )
  return tooltip ? (
    <ControlTooltip label={text} shortcut={shortcut ?? def?.shortcut}>
      {control}
    </ControlTooltip>
  ) : (
    control
  )
}

/* ---------------------------------------------------------------------------
 * Block type select, link, image
 * ------------------------------------------------------------------------- */

const blockOptions: { value: ActionName; label: string }[] = [
  { value: "paragraph", label: "Text" },
  { value: "heading1", label: "Heading 1" },
  { value: "heading2", label: "Heading 2" },
  { value: "heading3", label: "Heading 3" },
  { value: "blockquote", label: "Quote" },
  { value: "codeBlock", label: "Code block" },
]
const blockCollection = createListCollection({ items: blockOptions, itemToValue: (o) => o.value })

function RichTextEditorBlockSelect({ className, ...props }: RichTextEditorBlockSelectProps) {
  const { editor, editable } = useRichTextEditor()
  const current = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? (blockOptions.find((o) => (actions[o.value] as ActionDef).isActive?.(editor))?.value ?? "paragraph")
        : "paragraph",
  })
  const label = blockOptions.find((o) => o.value === current)?.label
  return (
    <Select.Root
      collection={blockCollection}
      value={[current ?? "paragraph"]}
      onValueChange={({ value }) => {
        const name = value[0] as ActionName | undefined
        if (editor && name) actions[name].run(editor)
      }}
      disabled={!editable}
      positioning={{ sameWidth: false }}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          <Select.Control>
            <Select.Trigger
              size="sm"
              className={cn("w-32", className)}
              data-slot="rich-text-editor-block-select"
              aria-label="Block type"
            >
              <Select.ValueText>{label}</Select.ValueText>
            </Select.Trigger>
          </Select.Control>
          <Select.Content>
            {blockOptions.map((o) => {
              const Icon = actions[o.value].icon
              return (
                <Select.Item key={o.value} item={o}>
                  <Icon className="size-4 text-muted-foreground" />
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              )
            })}
          </Select.Content>
        </>
      )}
    </Select.Root>
  )
}

/** Set or edit a link on the selection through a small popover form. */
function RichTextEditorLinkTrigger({ className, ...props }: RichTextEditorLinkTriggerProps) {
  const { editor, editable } = useRichTextEditor()
  const { active } = useActionState((e) => e.isActive("link"))
  const [open, setOpen] = React.useState(false)
  const [href, setHref] = React.useState("")
  const apply = () => {
    if (!editor) return
    const url = href.trim()
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    setOpen(false)
  }
  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open }) => {
        if (open) setHref((editor?.getAttributes("link").href as string | undefined) ?? "")
        setOpen(open)
      }}
      positioning={{ placement: "bottom-start" }}
    >
      <ControlTooltip label="Link" shortcut="⌘K">
        <Popover.Trigger asChild>
          <Toggle.Root
            data-slot="rich-text-editor-link-trigger"
            size="sm"
            aria-label="Link"
            pressed={active}
            disabled={!editable}
            className={cn("size-7 px-0", className)}
            {...props}
          >
            {props.asChild ? (
              React.isValidElement(props.children) ? (
                props.children
              ) : null
            ) : (
              <>
                <LinkIcon />
              </>
            )}
          </Toggle.Root>
        </Popover.Trigger>
      </ControlTooltip>
      <Popover.Content className="w-72">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
        >
          <Input.Root
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://example.com"
            aria-label="Link URL"
            autoFocus
            className="h-8"
          />
          <Button type="submit" size="sm">
            {href.trim() ? "Apply" : "Remove"}
          </Button>
        </form>
      </Popover.Content>
    </Popover.Root>
  )
}

/** Insert an image by URL. */
function RichTextEditorImageTrigger({ className, ...props }: RichTextEditorImageTriggerProps) {
  const { editor, editable } = useRichTextEditor()
  const [open, setOpen] = React.useState(false)
  const [src, setSrc] = React.useState("")
  return (
    <Popover.Root open={open} onOpenChange={({ open }) => setOpen(open)} positioning={{ placement: "bottom-start" }}>
      <ControlTooltip label="Image">
        <Popover.Trigger asChild>
          <Button
            data-slot="rich-text-editor-image-trigger"
            variant="ghost"
            size="icon-sm"
            aria-label="Image"
            disabled={!editable}
            className={className}
            {...props}
          >
            {props.asChild ? (
              React.isValidElement(props.children) ? (
                props.children
              ) : null
            ) : (
              <>
                <ImageIcon />
              </>
            )}
          </Button>
        </Popover.Trigger>
      </ControlTooltip>
      <Popover.Content className="w-72">
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (editor && src.trim()) editor.chain().focus().setImage({ src: src.trim() }).run()
            setSrc("")
            setOpen(false)
          }}
        >
          <Input.Root
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="https://…/image.png"
            aria-label="Image URL"
            autoFocus
            className="h-8"
          />
          <Button type="submit" size="sm" disabled={!src.trim()}>
            Insert
          </Button>
        </form>
      </Popover.Content>
    </Popover.Root>
  )
}

/* ---------------------------------------------------------------------------
 * Content, bubble menu, footer
 * ------------------------------------------------------------------------- */

function RichTextEditorContent({ className, ...props }: RichTextEditorContentProps) {
  const { editor } = useRichTextEditor()
  return (
    <EditorContent
      editor={editor}
      data-slot="rich-text-editor-content"
      className={cn(
        "prose prose-sm min-h-0 max-w-none flex-1 overflow-y-auto px-4 py-3 prose-neutral dark:prose-invert",
        "[&_.tiptap]:min-h-40 [&_.tiptap]:outline-none",
        className
      )}
      {...props}
    />
  )
}

/** A floating toolbar over the current text selection. Compose it from the same toggles. */
function RichTextEditorBubbleMenu({ className, children, ...props }: RichTextEditorBubbleMenuProps) {
  const { editor, editable } = useRichTextEditor()
  if (!editor || !editable) return null
  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor, from, to }) =>
        editable && from !== to && !editor.isActive("image") && !editor.isActive("codeBlock")
      }
      className={cn(
        "z-50 flex items-center gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      <div
        data-slot="rich-text-editor-bubble-menu"
        role="toolbar"
        aria-label="Selection formatting"
        className="contents"
      >
        {children}
      </div>
    </BubbleMenu>
  )
}

function RichTextEditorFooter({ className, ...props }: RichTextEditorFooterProps) {
  return (
    <ark.div
      data-slot="rich-text-editor-footer"
      className={cn("flex items-center gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function RichTextEditorCharacterCount({ className, ...props }: RichTextEditorCharacterCountProps) {
  const { editor } = useRichTextEditor()
  const stats = useEditorState({
    editor,
    selector: ({ editor }) => {
      const storage = editor?.storage.characterCount as { characters?: () => number; words?: () => number } | undefined
      return { characters: storage?.characters?.() ?? 0, words: storage?.words?.() ?? 0 }
    },
  })
  const limit = (
    editor?.extensionManager.extensions.find((e) => e.name === "characterCount")?.options as { limit?: number }
  )?.limit
  return (
    <ark.span
      data-slot="rich-text-editor-character-count"
      data-over={limit && stats && stats.characters >= limit ? "" : undefined}
      className={cn("tabular-nums data-over:text-destructive", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(props.children) ? (
          props.children
        ) : null
      ) : (
        <>
          {stats?.words ?? 0} words · {stats?.characters ?? 0}
          {limit ? ` / ${limit}` : ""} characters
        </>
      )}
    </ark.span>
  )
}

type RichTextEditorRootProps = Omit<React.ComponentProps<typeof ark.div>, "content" | "onChange"> & {
  /** Controlled HTML. Prefer `defaultContent` + `onChange` unless you need to replace the document. */
  content?: string
  /** Initial HTML when uncontrolled. */
  defaultContent?: string
  onChange?: (change: RichTextChange) => void
  placeholder?: string
  editable?: boolean
  /** Focus the editor on mount. */
  autofocus?: boolean
  /** Extra tiptap extensions appended to the built-in set. */
  extensions?: Extensions
  /** Maximum characters; the count shows `data-over` past it. */
  characterLimit?: number
  /** Escape hatch for any other `useEditor` option. */
  editorOptions?: Partial<UseEditorOptions>
}

type RichTextEditorToolbarProps = React.ComponentProps<typeof ark.div>

type RichTextEditorToolbarGroupProps = React.ComponentProps<typeof ark.div>

type RichTextEditorToolbarSeparatorProps = React.ComponentProps<typeof Separator.Root>

type RichTextEditorToggleProps = Omit<React.ComponentProps<typeof Toggle.Root>, "pressed" | "onPressedChange"> &
  ControlProps

type RichTextEditorTriggerProps = React.ComponentProps<typeof Button> & Omit<ControlProps, "isActive">

type RichTextEditorBlockSelectProps = Omit<
  React.ComponentProps<typeof Select.Root>,
  "collection" | "value" | "onValueChange"
>

type RichTextEditorLinkTriggerProps = React.ComponentProps<typeof Toggle.Root>

type RichTextEditorImageTriggerProps = React.ComponentProps<typeof Button>

type RichTextEditorContentProps = Omit<React.ComponentProps<typeof EditorContent>, "editor">

type RichTextEditorBubbleMenuProps = Omit<BubbleMenuProps, "editor">

type RichTextEditorFooterProps = React.ComponentProps<typeof ark.div>

type RichTextEditorCharacterCountProps = React.ComponentProps<typeof ark.span>

const RichTextEditor = {
  Root: RichTextEditorRoot,
  Toolbar: RichTextEditorToolbar,
  ToolbarGroup: RichTextEditorToolbarGroup,
  ToolbarSeparator: RichTextEditorToolbarSeparator,
  Toggle: RichTextEditorToggle,
  Trigger: RichTextEditorTrigger,
  BlockSelect: RichTextEditorBlockSelect,
  LinkTrigger: RichTextEditorLinkTrigger,
  ImageTrigger: RichTextEditorImageTrigger,
  Content: RichTextEditorContent,
  BubbleMenu: RichTextEditorBubbleMenu,
  Footer: RichTextEditorFooter,
  CharacterCount: RichTextEditorCharacterCount,
}

export {
  RichTextEditor,
  useRichTextEditor,
  actions as richTextActions,
  type RichTextChange,
  type ActionName as RichTextActionName,
  type RichTextEditorRootProps,
  type RichTextEditorToolbarProps,
  type RichTextEditorToolbarGroupProps,
  type RichTextEditorToolbarSeparatorProps,
  type RichTextEditorToggleProps,
  type RichTextEditorTriggerProps,
  type RichTextEditorBlockSelectProps,
  type RichTextEditorLinkTriggerProps,
  type RichTextEditorImageTriggerProps,
  type RichTextEditorContentProps,
  type RichTextEditorBubbleMenuProps,
  type RichTextEditorFooterProps,
  type RichTextEditorCharacterCountProps,
}
