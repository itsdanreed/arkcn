## How it works

A compositional editor on tiptap. The root creates the editor with StarterKit plus links, underline, placeholder, character count, task lists, highlight, text alignment, images, and tables; `extensions` appends more and `editorOptions` is the escape hatch. Content is HTML: `defaultContent` for uncontrolled use, `content` to control it (the document is replaced only when it differs), and `onChange({ html, json, text })`. `editable`, `autofocus`, `placeholder`, and `characterLimit` do what they say.

## Controls

Every toolbar control reads the editor from context and re-renders only when its own state changes. `RichTextEditorToggle name=` is a pressed control (bold, italic, underline, strike, code, highlight, paragraph and headings, lists, blockquote, code block, alignment, unset link) and `RichTextEditorTrigger name=` is one-shot (undo, redo, horizontal rule, clear formatting, insert table). Both accept `isActive`, `canRun`, `onToggle`, `label`, and `shortcut` for custom actions, wrap themselves in a tooltip with the shortcut, and are polymorphic via `asChild`. `RichTextEditor.BlockSelect` switches block types, `RichTextEditor.LinkTrigger` and `RichTextEditor.ImageTrigger` open small URL forms.

## Layout

`RichTextEditor.Toolbar` is a `role="toolbar"` with arrow-key roving, grouped by `RichTextEditor.ToolbarGroup` and `RichTextEditor.ToolbarSeparator`. `RichTextEditor.Content` renders the document with typography styles. `RichTextEditor.BubbleMenu` floats over text selections and composes the same toggles (pass `tooltip={false}` there). `RichTextEditor.Footer` with `RichTextEditor.CharacterCount` shows words and characters against the limit.

## Notes

- Editor CSS (placeholder, task lists, tables, selection) ships with the component and `add` merges it into your stylesheet.
- Markdown shortcuts work: `#`, `-`, `[]`, and triple backticks at the start of a line.
