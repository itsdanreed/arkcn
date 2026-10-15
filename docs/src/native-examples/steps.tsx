import { View } from "react-native"
import { Steps } from "@multicomma/arkcn-react-native/ui/steps"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

const items = ["Account", "Profile", "Review"]
export default function StepsExample() {
  const { colors } = useNativeTheme()
  return (
    <Steps.Root count={items.length} style={{ maxWidth: 512 }}>
      <Steps.List>
        {items.map((label, index) => (
          <Steps.Item key={label} index={index}>
            <Steps.Trigger accessibilityLabel={label}>
              <Steps.Indicator>{index + 1}</Steps.Indicator>
              {label}
            </Steps.Trigger>
            <Steps.Separator />
          </Steps.Item>
        ))}
      </Steps.List>
      {items.map((label, index) => (
        <Steps.Content
          key={label}
          index={index}
          style={{ paddingVertical: 16 }}
          textStyle={{ color: colors.mutedForeground }}
        >
          {label} step content.
        </Steps.Content>
      ))}
      <Steps.CompletedContent>All steps complete.</Steps.CompletedContent>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Steps.PrevTrigger>Back</Steps.PrevTrigger>
        <Steps.NextTrigger>Next</Steps.NextTrigger>
      </View>
    </Steps.Root>
  )
}
