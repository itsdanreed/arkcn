import { useState } from "react"
import { Text, View } from "react-native"
import { CheckIcon, XIcon, PencilIcon } from "lucide-react-native"
import { Editable } from "@/components/ui/editable"
import { useNativeTheme } from "@/lib/theme"

/** Device-only fixture for keyboard dismissal and Save/Cancel ordering. */
export function EditableValidation() {
  const { colors, typography } = useNativeTheme()
  const [result, setResult] = useState("No action yet")
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ ...typography.medium, color: colors.foreground, fontSize: 14 }}>Explicit actions</Text>
      <Editable.Root
        defaultValue="Project title"
        onValueCommit={({ value }) => setResult(`Saved: ${value}`)}
        onValueRevert={({ value }) => setResult(`Cancelled: ${value}`)}
      >
        <Editable.Label>Project</Editable.Label>
        <Editable.Area>
          <Editable.Input />
          <Editable.Preview />
        </Editable.Area>
        <Editable.Control>
          <Editable.EditTrigger size="icon-sm" accessibilityLabel="Edit project">
            <PencilIcon size={16} color={colors.foreground} />
          </Editable.EditTrigger>
          <Editable.SubmitTrigger size="icon-sm" accessibilityLabel="Save project">
            <CheckIcon size={16} color={colors.foreground} />
          </Editable.SubmitTrigger>
          <Editable.CancelTrigger size="icon-sm" accessibilityLabel="Cancel project">
            <XIcon size={16} color={colors.foreground} />
          </Editable.CancelTrigger>
        </Editable.Control>
      </Editable.Root>
      <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14 }}>{result}</Text>
    </View>
  )
}
