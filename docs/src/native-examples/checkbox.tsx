import { View } from "react-native"
import { Checkbox } from "@multicomma/arkcn-react-native/ui/checkbox"
export default function CheckboxExample() {
  return (
    <View style={{ gap: 12, maxWidth: "100%" }}>
      <Checkbox.Root defaultChecked>
        <Checkbox.Control />
        <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      </Checkbox.Root>
      <Checkbox.Root>
        <Checkbox.Control />
        <Checkbox.Label>Subscribe to the newsletter</Checkbox.Label>
      </Checkbox.Root>
      <Checkbox.Root disabled>
        <Checkbox.Control />
        <Checkbox.Label>Disabled</Checkbox.Label>
      </Checkbox.Root>
    </View>
  )
}
