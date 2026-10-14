import { useState } from "react"
import { Hotkeys, useHotkey, useHotkeysDialog } from "@/components/ui/hotkeys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuditMotion } from "../audit-motion"
function Demo() {
  const [count, setCount] = useState(0)
  useHotkey("shift+s", () => setCount((n) => n + 1), { label: "Save", group: "File" })
  useHotkey("g h", () => setCount((n) => n + 1), { label: "Go home", group: "Navigate" })
  useHotkey("shift+x", () => setCount((n) => n + 1), { label: "Unavailable action", group: "File", enabled: false })
  const { setOpen } = useHotkeysDialog()
  return (
    <>
      <section data-audit-case="caps" className="flex flex-wrap items-center gap-3">
        <Hotkeys.Kbd hotkey="shift+s" />
        <Hotkeys.Kbd hotkey="g h" />
        <Hotkeys.Kbd hotkey="ctrl+alt+delete" />
      </section>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show shortcuts
      </Button>
      <Input.Root aria-label="Typing area" placeholder="Shortcuts should not fire here" />
      <output aria-label="Action count">{count}</output>
      <Hotkeys.Dialog />
    </>
  )
}
export default function Example() {
  const [mode, setMode] = useState("?")
  const { trace } = useAuditMotion('[data-slot="hotkeys-dialog"]')
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
      <Hotkeys.Root dialogHotkey={mode === "none" ? null : mode}>
        <Demo />
      </Hotkeys.Root>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
