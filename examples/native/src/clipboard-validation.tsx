import { useState } from "react"
import { Text, View } from "react-native"
import { Clipboard } from "@/components/ui/clipboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNativeTheme } from "@/lib/theme"

export function ClipboardValidation() {
  const { colors, typography } = useNativeTheme()
  const [value, setValue] = useState("Native clipboard ✓")
  const [pasted, setPasted] = useState("")
  const [copies, setCopies] = useState(0)
  const [status, setStatus] = useState("Ready to copy")
  return (
    <View style={{ gap: 16 }}>
      <Input.Root accessibilityLabel="Text to copy" value={value} onChangeText={setValue} />
      <Clipboard.Root
        value={value}
        onCopy={() => setCopies((n) => n + 1)}
        onStatusChange={({ copied }) => setStatus(copied ? "Copied successfully" : "Ready to copy")}
        onCopyError={() => setStatus("Copy failed")}
      >
        <Clipboard.Control>
          <Clipboard.ValueText style={{ flex: 1 }} />
          <Clipboard.Trigger size="default" accessibilityLabel="Copy editable text">
            <Clipboard.Indicator copied="Copied">Copy text</Clipboard.Indicator>
          </Clipboard.Trigger>
        </Clipboard.Control>
      </Clipboard.Root>
      <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }}>
        {status} · {copies} successful copies
      </Text>
      <Input.Root
        accessibilityLabel="Paste verification"
        placeholder="Paste here to verify copied text"
        value={pasted}
        onChangeText={setPasted}
      />
      <Button
        variant="outline"
        onPress={() => {
          setValue("Updated clipboard ✓")
          setPasted("")
        }}
      >
        Change source text
      </Button>
      <Clipboard.Root value="Disabled copy" disabled>
        <Clipboard.Label>Disabled</Clipboard.Label>
        <Clipboard.Control>
          <Clipboard.Input />
          <Clipboard.Trigger accessibilityLabel="Disabled copy" />
        </Clipboard.Control>
      </Clipboard.Root>
    </View>
  )
}
