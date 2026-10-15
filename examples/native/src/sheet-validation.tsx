import { useState } from "react"
import { View, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Sheet, type SheetContentProps } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useNativeTheme } from "@/lib/theme"

export function SheetValidation() {
  const insets = useSafeAreaInsets()
  const { colors, typography } = useNativeTheme()
  const [last, setLast] = useState("No changes yet")
  return (
    <View style={{ gap: 12 }}>
      {(["left", "right", "top", "bottom"] as const).map((side) => (
        <SheetCase key={side} side={side} insets={insets} onSave={() => setLast(`Saved ${side} panel`)} />
      ))}
      <Text
        accessibilityLiveRegion="polite"
        style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}
      >
        {last}
      </Text>
    </View>
  )
}
function SheetCase({
  side,
  insets,
  onSave,
}: {
  side: SheetContentProps["side"]
  insets: ReturnType<typeof useSafeAreaInsets>
  onSave: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet.Root open={open} onOpenChange={({ open }) => setOpen(open)} safeAreaInsets={insets}>
      <Sheet.Trigger>Open {side} panel</Sheet.Trigger>
      <Sheet.Content side={side}>
        <Sheet.Header>
          <Sheet.Title>{side} panel</Sheet.Title>
          <Sheet.Description>Check scrolling, keyboard, safe areas, and dismissal.</Sheet.Description>
        </Sheet.Header>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {Array.from({ length: side === "left" ? 18 : 2 }, (_, index) => (
            <Input.Root key={index} accessibilityLabel={`Field ${index + 1}`} placeholder={`Field ${index + 1}`} />
          ))}
        </View>
        <Sheet.Footer>
          <Sheet.CloseTrigger onPress={onSave}>Save panel</Sheet.CloseTrigger>
          <Sheet.CloseTrigger variant="outline">Cancel</Sheet.CloseTrigger>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  )
}
