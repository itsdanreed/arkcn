import { useState } from "react"
import { Text, View } from "react-native"
import { TagsInput } from "@/components/ui/tags-input"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function TagsInputValidation() {
  const [value, setValue] = useState(["expo"])
  const [mode, setMode] = useState<"editable" | "readOnly" | "disabled">("editable")
  const [error, setError] = useState("")
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          variant="outline"
          onPress={() => setMode(mode === "editable" ? "readOnly" : mode === "readOnly" ? "disabled" : "editable")}
        >
          {mode}
        </Button>
        <Button
          variant="outline"
          onPress={() => {
            setValue(["reset"])
            setError("")
          }}
        >
          Reset tags
        </Button>
      </View>
      <TagsInput.Root
        value={value}
        onValueChange={({ value }) => {
          setValue(value)
        }}
        onInputValueChange={({ inputValue }) => {
          if (!inputValue) setError("")
        }}
        disabled={mode === "disabled"}
        readOnly={mode === "readOnly"}
        invalid={!!error}
        max={3}
        addOnPaste
        onValueInvalid={({ reason }) => setError(reason)}
      >
        <TagsInput.Label>Controlled topics (max 3)</TagsInput.Label>
        <TagsInput.Control>
          <TagsInput.Context>
            {(api) =>
              api.value.map((value, index) => (
                <TagsInput.Item key={`${index}:${value}`} index={index} value={value}>
                  <TagsInput.ItemPreview>
                    <TagsInput.ItemText />
                    <TagsInput.ItemDeleteTrigger />
                  </TagsInput.ItemPreview>
                  <TagsInput.ItemInput />
                </TagsInput.Item>
              ))
            }
          </TagsInput.Context>
          <TagsInput.Input placeholder="Add topics…" />
          <TagsInput.ClearTrigger />
        </TagsInput.Control>
      </TagsInput.Root>
      <Text
        style={{
          ...typography.regular,
          fontSize: 14,
          lineHeight: 20,
          color: error ? colors.destructive : colors.mutedForeground,
        }}
      >
        {error ? `Rejected: ${error}` : `Values: ${value.join(", ") || "none"}`}
      </Text>
    </View>
  )
}
