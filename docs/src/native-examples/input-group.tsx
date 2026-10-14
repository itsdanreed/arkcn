import { SearchIcon } from "lucide-react-native"
import { View } from "react-native"
import { InputGroup } from "@multicomma/arkcn-react-native/ui/input-group"
export default function InputGroupExample() {
  return (
    <View style={{ width: 320, maxWidth: "100%", gap: 12 }}>
      <InputGroup.Root>
        <InputGroup.Addon accessibilityLabel="Focus search">
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input accessibilityLabel="Search" placeholder="Search…" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text>https://</InputGroup.Text>
        </InputGroup.Addon>
        <InputGroup.Input accessibilityLabel="Website" placeholder="example.com" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Input accessibilityLabel="Email" placeholder="Email address" invalid />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Text>Required</InputGroup.Text>
        </InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Input accessibilityLabel="Disabled input" placeholder="Disabled" disabled />
        <InputGroup.Addon align="inline-end">
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Textarea accessibilityLabel="Message" placeholder="Write a message…" />
        <InputGroup.Addon align="block-end">
          <InputGroup.Trigger>Send</InputGroup.Trigger>
        </InputGroup.Addon>
      </InputGroup.Root>
    </View>
  )
}
