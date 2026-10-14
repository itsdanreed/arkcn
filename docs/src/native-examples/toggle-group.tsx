import { View } from "react-native"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react-native"
import { ToggleGroup } from "@multicomma/arkcn-react-native/ui/toggle-group"
export default function ToggleGroupExample() {
  return (
    <View style={{ gap: 16 }}>
      <ToggleGroup.Root defaultValue={["left"]}>
        <ToggleGroup.Item value="left" accessibilityLabel="Align left">
          <AlignLeftIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" accessibilityLabel="Align center">
          <AlignCenterIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="right" accessibilityLabel="Align right">
          <AlignRightIcon />
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      <ToggleGroup.Root multiple variant="outline" spacing={0} defaultValue={["bold"]}>
        <ToggleGroup.Item value="bold" accessibilityLabel="Bold">
          <BoldIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" accessibilityLabel="Italic">
          <ItalicIcon />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="underline" accessibilityLabel="Underline">
          <UnderlineIcon />
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </View>
  )
}
