import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HotkeyKbd, HotkeysDialog, HotkeysProvider, useHotkey, useHotkeysDialog } from "@/components/ui/hotkeys"

function Demo() {
  useHotkey("mod+s", () => toast("Saved"), { label: "Save", group: "File" })
  useHotkey("g h", () => toast("Home"), { label: "Go home", group: "Navigate" })
  const { setOpen } = useHotkeysDialog()
  return (
    <div className="flex flex-col items-center gap-3 text-sm">
      <p className="text-muted-foreground">
        Press <HotkeyKbd hotkey="mod+s" /> or <HotkeyKbd hotkey="g h" />, or <HotkeyKbd hotkey="?" /> for the cheat
        sheet.
      </p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show shortcuts
      </Button>
    </div>
  )
}

export default function HotkeysExample() {
  return (
    <HotkeysProvider>
      <Demo />
      <HotkeysDialog />
    </HotkeysProvider>
  )
}
