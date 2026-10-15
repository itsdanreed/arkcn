import { Clipboard } from "@multicomma/arkcn-react-native/ui/clipboard"

export default function ClipboardExample() {
  return (
    <Clipboard.Root value="npx @multicomma/arkcn init" style={{ width: 320, maxWidth: "100%" }}>
      <Clipboard.Label>Install command</Clipboard.Label>
      <Clipboard.Control>
        <Clipboard.Input />
        <Clipboard.Trigger />
      </Clipboard.Control>
    </Clipboard.Root>
  )
}
