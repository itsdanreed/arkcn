import {
  RichTextEditor,
  RichTextEditorBlockSelect,
  RichTextEditorBubbleMenu,
  RichTextEditorCharacterCount,
  RichTextEditorContent,
  RichTextEditorFooter,
  RichTextEditorLinkTrigger,
  RichTextEditorToggle,
  RichTextEditorToolbar,
  RichTextEditorToolbarGroup,
  RichTextEditorToolbarSeparator,
  RichTextEditorTrigger,
} from "@/components/ui/rich-text-editor"

const sample =
  "<h2>Release notes</h2><p>The editor runs on <strong>tiptap</strong>. Select text to see the bubble menu.</p><ul><li>Toolbar and bubble menu compose the same toggles</li><li>Markdown shortcuts work</li></ul>"

export default function RichTextEditorExample() {
  return (
    <RichTextEditor defaultContent={sample} placeholder="Start writing…" characterLimit={2000} className="w-full">
      <RichTextEditorToolbar>
        <RichTextEditorToolbarGroup>
          <RichTextEditorTrigger name="undo" />
          <RichTextEditorTrigger name="redo" />
        </RichTextEditorToolbarGroup>
        <RichTextEditorToolbarSeparator />
        <RichTextEditorBlockSelect />
        <RichTextEditorToolbarSeparator />
        <RichTextEditorToolbarGroup>
          <RichTextEditorToggle name="bold" />
          <RichTextEditorToggle name="italic" />
          <RichTextEditorToggle name="underline" />
          <RichTextEditorToggle name="code" />
        </RichTextEditorToolbarGroup>
        <RichTextEditorToolbarSeparator />
        <RichTextEditorToolbarGroup>
          <RichTextEditorToggle name="bulletList" />
          <RichTextEditorToggle name="orderedList" />
          <RichTextEditorToggle name="taskList" />
          <RichTextEditorLinkTrigger />
        </RichTextEditorToolbarGroup>
      </RichTextEditorToolbar>
      <RichTextEditorContent className="min-h-48" />
      <RichTextEditorBubbleMenu>
        <RichTextEditorToggle name="bold" tooltip={false} />
        <RichTextEditorToggle name="italic" tooltip={false} />
        <RichTextEditorToggle name="highlight" tooltip={false} />
      </RichTextEditorBubbleMenu>
      <RichTextEditorFooter>
        <RichTextEditorCharacterCount />
      </RichTextEditorFooter>
    </RichTextEditor>
  )
}
