import { Clipboard } from "@/components/ui/clipboard"

export default function ClipboardExample() {
  return (
    <Clipboard.Root value="npx @multicomma/arkcn init" className="w-80">
      <Clipboard.Label>Install command</Clipboard.Label>
      <Clipboard.Control>
        <Clipboard.Input />
        <Clipboard.Trigger />
      </Clipboard.Control>
    </Clipboard.Root>
  )
}
