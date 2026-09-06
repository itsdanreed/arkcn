import * as React from "react"
import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  RichTextEditor,
  RichTextEditorBlockSelect,
  RichTextEditorBubbleMenu,
  RichTextEditorCharacterCount,
  RichTextEditorContent,
  RichTextEditorFooter,
  RichTextEditorImageTrigger,
  RichTextEditorLinkTrigger,
  RichTextEditorToggle,
  RichTextEditorToolbar,
  RichTextEditorToolbarGroup,
  RichTextEditorToolbarSeparator,
  RichTextEditorTrigger,
  type RichTextChange,
} from "@/components/ui/rich-text-editor"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { Switch } from "@/components/ui/switch"

const sample = `
<h1>Release notes: September</h1>
<p>This month we shipped the <strong>editable data grid</strong>, a <em>sentence-style</em> query builder, and a node graph with a built-in simulator. Thanks to everyone who filed feedback along the way.</p>
<h2>Highlights</h2>
<ul>
  <li>Inline editing with keyboard navigation, range selection, and copy/paste.</li>
  <li>Filters that read like a sentence and ignore unfinished conditions.</li>
  <li>A <a href="https://example.com/blueprint">visual scripting graph</a> with breakpoints on the way.</li>
</ul>
<h2>Next up</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Rich text editor</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Scheduler and calendar view</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Activity feed and comments</p></div></li>
</ul>
<blockquote><p>Ship small, ship often, and <mark>listen</mark>.</p></blockquote>
<pre><code>npm run lint &amp;&amp; npm test</code></pre>
`.trim()

type Format = "html" | "json" | "text"

export function RichTextPage() {
  const [change, setChange] = React.useState<RichTextChange | null>(null)
  const [format, setFormat] = React.useState<Format>("html")
  const [editable, setEditable] = React.useState(true)
  const [resetKey, setResetKey] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  const output =
    format === "html"
      ? (change?.html ?? sample)
      : format === "json"
        ? JSON.stringify(change?.json ?? {}, null, 2)
        : (change?.text ?? "")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy to the clipboard")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Select text for the floating toolbar. Markdown shortcuts work too: type <code>#</code>, <code>-</code>,{" "}
            <code>[]</code>, or <code>```</code> at the start of a line.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Label className="flex items-center gap-2 text-sm">
            <Switch size="sm" checked={editable} onCheckedChange={({ checked }) => setEditable(checked)} />
            Editable
          </Label>
          <Button
            variant="outline"
            onClick={() => {
              setResetKey((k) => k + 1)
              setChange(null)
            }}
          >
            <RotateCcwIcon /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <RichTextEditor
          key={resetKey}
          defaultContent={sample}
          onChange={setChange}
          editable={editable}
          placeholder="Start writing, or type / for commands…"
          characterLimit={5000}
          className="min-h-128"
        >
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
              <RichTextEditorToggle name="strike" />
              <RichTextEditorToggle name="code" />
              <RichTextEditorToggle name="highlight" />
            </RichTextEditorToolbarGroup>
            <RichTextEditorToolbarSeparator />
            <RichTextEditorToolbarGroup>
              <RichTextEditorToggle name="bulletList" />
              <RichTextEditorToggle name="orderedList" />
              <RichTextEditorToggle name="taskList" />
            </RichTextEditorToolbarGroup>
            <RichTextEditorToolbarSeparator />
            <RichTextEditorToolbarGroup>
              <RichTextEditorToggle name="alignLeft" />
              <RichTextEditorToggle name="alignCenter" />
              <RichTextEditorToggle name="alignRight" />
            </RichTextEditorToolbarGroup>
            <RichTextEditorToolbarSeparator />
            <RichTextEditorToolbarGroup>
              <RichTextEditorLinkTrigger />
              <RichTextEditorImageTrigger />
              <RichTextEditorTrigger name="insertTable" />
              <RichTextEditorTrigger name="horizontalRule" />
              <RichTextEditorTrigger name="clearFormatting" />
            </RichTextEditorToolbarGroup>
          </RichTextEditorToolbar>
          <RichTextEditorContent />
          <RichTextEditorBubbleMenu>
            <RichTextEditorToggle name="bold" tooltip={false} />
            <RichTextEditorToggle name="italic" tooltip={false} />
            <RichTextEditorToggle name="underline" tooltip={false} />
            <RichTextEditorToggle name="highlight" tooltip={false} />
            <RichTextEditorToggle name="code" tooltip={false} />
            <RichTextEditorLinkTrigger />
          </RichTextEditorBubbleMenu>
          <RichTextEditorFooter>
            <RichTextEditorCharacterCount />
            <span className="ml-auto">{editable ? "Editing" : "Read only"}</span>
          </RichTextEditorFooter>
        </RichTextEditor>

        <Card className="min-h-0">
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Output</CardTitle>
              <CardDescription>What `onChange` reports.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SegmentGroup value={format} onValueChange={({ value }) => value && setFormat(value as Format)}>
                <SegmentGroupIndicator />
                <SegmentGroupItem value="html">HTML</SegmentGroupItem>
                <SegmentGroupItem value="json">JSON</SegmentGroupItem>
                <SegmentGroupItem value="text">Text</SegmentGroupItem>
              </SegmentGroup>
              <Button variant="outline" size="icon-sm" aria-label="Copy output" onClick={copy}>
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre
              data-output
              className="max-h-112 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs/relaxed wrap-break-word whitespace-pre-wrap"
            >
              {output}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
