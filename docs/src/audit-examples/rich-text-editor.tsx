import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

const sample =
  "<h2>Release notes</h2><p>Write a <strong>clear update</strong> for your team.</p><ul><li>Review the changes</li><li>Publish when ready</li></ul>"
export default function Example() {
  const [editable, setEditable] = useState(true)
  const [content, setContent] = useState(sample)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditable(!editable)}>
          {editable ? "Read only" : "Edit"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setContent("")}>
          Empty
        </Button>
        <Button variant="outline" size="sm" onClick={() => setContent(sample)}>
          Reset
        </Button>
      </div>
      <RichTextEditor.Root
        content={content}
        onChange={({ html }) => setContent(html)}
        editable={editable}
        placeholder="Start writing…"
        characterLimit={2000}
      >
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
            <RichTextEditor.ImageTrigger />
          </RichTextEditor.ToolbarGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
        <RichTextEditor.BubbleMenu>
          <RichTextEditor.Toggle name="bold" tooltip={false} />
          <RichTextEditor.Toggle name="italic" tooltip={false} />
          <RichTextEditor.Toggle name="highlight" tooltip={false} />
        </RichTextEditor.BubbleMenu>
        <RichTextEditor.Footer>
          <RichTextEditor.CharacterCount />
        </RichTextEditor.Footer>
      </RichTextEditor.Root>
      <output hidden data-audit-html>
        {content}
      </output>
    </div>
  )
}
