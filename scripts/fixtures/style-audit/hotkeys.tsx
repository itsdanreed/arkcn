import { useState } from "react"
import { Kbd, KbdGroup } from "../ui/kbd"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useAuditMotion } from "../../src/audit-motion"
const mac = /mac|iphone|ipad|ipod/i.test(navigator.platform)
const shift = mac ? "⇧" : "Shift"
function Caps({ chords }: { chords: string[][] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {chords.map((keys, i) => (
        <span key={i} className="contents">
          {i > 0 && <span className="text-xs text-muted-foreground">then</span>}
          <KbdGroup>
            {keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </KbdGroup>
        </span>
      ))}
    </span>
  )
}
export default function Example() {
  const [mode, setMode] = useState("?")
  const [open, setOpen] = useState(false)
  const { trace } = useAuditMotion('[data-slot="dialog-content"]')
  const groups = [
    {
      name: "File",
      items: [
        { label: "Save", chords: [[shift, "S"]] },
        { label: "Unavailable action", chords: [[shift, "X"]] },
      ],
    },
    { name: "Navigate", items: [{ label: "Go home", chords: [["G"], ["H"]] }] },
    ...(mode === "none"
      ? []
      : [{ name: "General", items: [{ label: "Show this dialog", chords: mode === "?" ? [["?"]] : [[shift, "H"]] }] }]),
  ]
  return (
    <div className="flex max-w-lg flex-col items-start gap-4">
      <label>
        Dialog shortcut{" "}
        <select aria-label="Dialog shortcut" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="?">Default (?)</option>
          <option value="shift+h">Custom (Shift H)</option>
          <option value="none">Disabled</option>
        </select>
      </label>
      <section data-audit-case="caps" className="flex flex-wrap items-center gap-3">
        <Caps chords={[[shift, "S"]]} />
        <Caps chords={[["G"], ["H"]]} />
        <Caps chords={[[mac ? "⌃" : "Ctrl", mac ? "⌥" : "Alt", mac ? "⌦" : "Delete"]]} />
      </section>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show shortcuts
      </Button>
      <Input aria-label="Typing area" placeholder="Shortcuts should not fire here" />
      <output aria-label="Action count">0</output>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Shortcuts work anywhere on the page except while typing.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            {groups.map((group) => (
              <div key={group.name} className="flex flex-col gap-1.5">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">{group.name}</h4>
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{item.label}</span>
                    <Caps chords={item.chords} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
