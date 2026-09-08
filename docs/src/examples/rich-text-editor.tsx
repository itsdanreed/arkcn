import { RichTextEditor } from "@/components/ui/rich-text-editor"

const sample =
  "<h2>Release notes</h2><p>The editor runs on <strong>tiptap</strong>. Select text to see the bubble menu.</p><ul><li>Toolbar and bubble menu compose the same toggles</li><li>Markdown shortcuts work</li></ul>"

export default function RichTextEditorExample() {
  return (
    <RichTextEditor.Root defaultContent={sample} placeholder="Start writing…" characterLimit={2000} className="w-full">
      <RichTextEditor.Toolbar>
        <RichTextEditor.ToolbarGroup>
          <RichTextEditor.Trigger name="undo" />
          <RichTextEditor.Trigger name="redo" />
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.BlockSelect />
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup>
          <RichTextEditor.Toggle name="bold" />
          <RichTextEditor.Toggle name="italic" />
          <RichTextEditor.Toggle name="underline" />
          <RichTextEditor.Toggle name="code" />
        </RichTextEditor.ToolbarGroup>
        <RichTextEditor.ToolbarSeparator />
        <RichTextEditor.ToolbarGroup>
          <RichTextEditor.Toggle name="bulletList" />
          <RichTextEditor.Toggle name="orderedList" />
          <RichTextEditor.Toggle name="taskList" />
          <RichTextEditor.LinkTrigger />
        </RichTextEditor.ToolbarGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content className="min-h-48" />
      <RichTextEditor.BubbleMenu>
        <RichTextEditor.Toggle name="bold" tooltip={false} />
        <RichTextEditor.Toggle name="italic" tooltip={false} />
        <RichTextEditor.Toggle name="highlight" tooltip={false} />
      </RichTextEditor.BubbleMenu>
      <RichTextEditor.Footer>
        <RichTextEditor.CharacterCount />
      </RichTextEditor.Footer>
    </RichTextEditor.Root>
  )
}
