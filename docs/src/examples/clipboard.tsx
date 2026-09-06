import {
  Clipboard,
  ClipboardControl,
  ClipboardInput,
  ClipboardLabel,
  ClipboardTrigger,
} from "@/components/ui/clipboard"

export default function ClipboardExample() {
  return (
    <Clipboard value="npx @multicomma/arkcn init" className="w-80">
      <ClipboardLabel>Install command</ClipboardLabel>
      <ClipboardControl>
        <ClipboardInput />
        <ClipboardTrigger />
      </ClipboardControl>
    </Clipboard>
  )
}
