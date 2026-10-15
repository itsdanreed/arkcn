import { useRef, useState, type ComponentRef } from "react"
import { Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Trash2 } from "lucide-react-native"
import { Dialog } from "@/components/ui/dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useNativeTheme } from "@/lib/theme"

export function DialogValidation() {
  const { colors, typography } = useNativeTheme()
  const insets = useSafeAreaInsets()
  const input = useRef<ComponentRef<typeof TextInput>>(null)
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState("No decision yet")
  const text = { ...typography.regular, color: colors.foreground, fontSize: 14, lineHeight: 20 }
  return (
    <View style={{ gap: 16 }}>
      <Dialog.Root initialFocusRef={input} safeAreaInsets={insets}>
        <Dialog.Trigger>Long form and keyboard</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Long form</Dialog.Title>
            <Dialog.Description>Focus, keyboard avoidance, and scrolling.</Dialog.Description>
          </Dialog.Header>
          <Input.Root ref={input} accessibilityLabel="First field" placeholder="Type here" />
          {Array.from({ length: 14 }, (_, i) => (
            <View key={i} style={{ gap: 8 }}>
              <Text style={text}>Field {i + 2}</Text>
              <Input.Root accessibilityLabel={`Field ${i + 2}`} placeholder="Optional value" />
            </View>
          ))}
          <Dialog.Footer>
            <Dialog.CloseTrigger>Done</Dialog.CloseTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
      <AlertDialog.Root open={open} onOpenChange={({ open }) => setOpen(open)} safeAreaInsets={insets}>
        <AlertDialog.Trigger>Small confirmation</AlertDialog.Trigger>
        <AlertDialog.Content size="sm">
          <AlertDialog.Header>
            <AlertDialog.Media>
              <Trash2 size={20} color={colors.foreground} />
            </AlertDialog.Media>
            <AlertDialog.Title>Remove this draft?</AlertDialog.Title>
            <AlertDialog.Description>This demo only updates the status below.</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel onPress={() => setResult("Cancelled")}>Cancel</AlertDialog.Cancel>
            <AlertDialog.CloseTrigger onPress={() => setResult("Confirmed")}>Remove</AlertDialog.CloseTrigger>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
      <Text accessibilityLiveRegion="polite" style={text}>
        {result}
      </Text>
    </View>
  )
}
