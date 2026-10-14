import { useState } from "react"
import { View } from "react-native"
import { Checkbox } from "@multicomma/arkcn-react-native/ui/checkbox"
import { Label } from "@multicomma/arkcn-react-native/ui/label"
export default function LabelExample() {
  const [checked, setChecked] = useState(false)
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Checkbox.Root
        checked={checked}
        onCheckedChange={({ checked }) => setChecked(checked === true)}
        accessibilityLabel="Accept terms and conditions"
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox.Root>
      <Label.Root onPress={() => setChecked((value) => !value)}>Accept terms and conditions</Label.Root>
    </View>
  )
}
