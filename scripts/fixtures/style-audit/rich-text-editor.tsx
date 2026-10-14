// Related control palette, not an upstream rich-text editor. Document layout is fixture-authored.
import { useState } from "react"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  Undo2Icon,
  Redo2Icon,
  ListIcon,
  ListOrderedIcon,
  ListChecksIcon,
  LinkIcon,
  ImageIcon,
} from "lucide-react"
import { Button } from "../ui/button"
import { Toggle } from "../ui/toggle"
import { Separator } from "../ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"

export default function Example() {
  const [editable, setEditable] = useState(true)
  const [empty, setEmpty] = useState(false)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditable(!editable)}>
          {editable ? "Read only" : "Edit"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEmpty(true)}>
          Empty
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEmpty(false)}>
          Reset
        </Button>
      </div>
      <div className="rounded-xl border bg-background text-sm">
        <div
          role="toolbar"
          aria-label="Reference formatting controls"
          className="flex flex-wrap items-center gap-1 border-b p-1.5"
        >
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" aria-label="Undo" disabled>
              <Undo2Icon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Redo" disabled>
              <Redo2Icon />
            </Button>
          </div>
          <Separator orientation="vertical" className="mx-1 h-5 self-center" />
          <Select defaultValue="Heading 2" disabled={!editable}>
            <SelectTrigger size="sm" aria-label="Block type" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Text", "Heading 1", "Heading 2", "Heading 3", "Quote", "Code block"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="mx-1 h-5 self-center" />
          <div className="flex items-center gap-0.5">
            {(
              [
                ["Bold", BoldIcon],
                ["Italic", ItalicIcon],
                ["Underline", UnderlineIcon],
                ["Inline code", CodeIcon],
              ] as const
            ).map(([name, Icon]) => (
              <Toggle
                key={String(name)}
                aria-label={String(name)}
                size="sm"
                className="size-7 px-0"
                disabled={!editable}
              >
                <Icon />
              </Toggle>
            ))}
          </div>
          <Separator orientation="vertical" className="mx-1 h-5 self-center" />
          <div className="flex items-center gap-0.5">
            {(
              [
                ["Bullet list", ListIcon],
                ["Numbered list", ListOrderedIcon],
                ["Task list", ListChecksIcon],
                ["Link", LinkIcon],
              ] as const
            ).map(([name, Icon]) => (
              <Toggle
                key={String(name)}
                aria-label={String(name)}
                size="sm"
                className="size-7 px-0"
                disabled={!editable}
              >
                <Icon />
              </Toggle>
            ))}
            <Button variant="ghost" size="icon-sm" aria-label="Image" disabled={!editable}>
              <ImageIcon />
            </Button>
          </div>
        </div>
        <div className="min-h-46 space-y-4 px-4 py-3 text-sm/relaxed">
          {empty ? (
            <p className="text-muted-foreground">Start writing…</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold tracking-tight">Release notes</h2>
              <p>
                Write a <strong>clear update</strong> for your team.
              </p>
              <ul className="list-disc space-y-2 ps-5">
                <li>Review the changes</li>
                <li>Publish when ready</li>
              </ul>
            </>
          )}
        </div>
        <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
          Independent shadcn controls · document is a layout sample
        </div>
      </div>
    </div>
  )
}
