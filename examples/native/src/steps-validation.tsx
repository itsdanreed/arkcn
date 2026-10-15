import { useState } from "react"
import { Text, View } from "react-native"
import { Steps } from "@/components/ui/steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNativeTheme } from "@/lib/theme"

export function StepsValidation() {
  const { colors, typography } = useNativeTheme()
  const [name, setName] = useState("")
  const [status, setStatus] = useState("Enter a name to continue.")
  const [vertical, setVertical] = useState(false)
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...typography.medium, fontSize: 16, color: colors.foreground }}>Linear steps with validation</Text>
      <Button variant="outline" onPress={() => setVertical(!vertical)}>
        {vertical ? "Horizontal layout" : "Vertical layout"}
      </Button>
      <Steps.Root
        count={3}
        linear
        orientation={vertical ? "vertical" : "horizontal"}
        isStepValid={(index) => index !== 0 || name.trim().length > 0}
        onStepInvalid={() => setStatus("A name is required.")}
        onStepChange={({ step }) => setStatus(`Step ${step + 1}`)}
        onStepComplete={() => setStatus("Complete.")}
      >
        <Steps.List>
          {["Name", "Details", "Finish"].map((label, index) => (
            <Steps.Item index={index} key={label}>
              <Steps.Trigger accessibilityLabel={label}>
                <Steps.Indicator />
                {label}
              </Steps.Trigger>
              <Steps.Separator />
            </Steps.Item>
          ))}
        </Steps.List>
        <View style={{ flex: vertical ? 1 : undefined, gap: 16 }}>
          <Steps.Progress accessibilityLabel="Form progress" />
          <Steps.Content index={0}>
            <Input.Root accessibilityLabel="Your name" placeholder="Your name" value={name} onChangeText={setName} />
          </Steps.Content>
          <Steps.Content index={1}>Your name is preserved when you go back.</Steps.Content>
          <Steps.Content index={2}>Ready to finish.</Steps.Content>
          <Steps.CompletedContent>All done.</Steps.CompletedContent>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Steps.PrevTrigger accessibilityLabel="Previous form step">Back</Steps.PrevTrigger>
            <Steps.NextTrigger accessibilityLabel="Next form step">Next</Steps.NextTrigger>
            <Steps.Context>
              {(api) => (
                <Button size="sm" variant="ghost" onPress={api.resetStep}>
                  Reset
                </Button>
              )}
            </Steps.Context>
          </View>
        </View>
      </Steps.Root>
      <Text
        accessibilityLiveRegion="polite"
        style={{ ...typography.regular, fontSize: 14, color: colors.mutedForeground }}
      >
        {status}
      </Text>
    </View>
  )
}
