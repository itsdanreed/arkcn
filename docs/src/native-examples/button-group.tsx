import { View } from "react-native"
import { Button } from "@multicomma/arkcn-react-native/ui/button"
import { ButtonGroup } from "@multicomma/arkcn-react-native/ui/button-group"
export default function ButtonGroupExample() {
  return (
    <View style={{ gap: 16, alignItems: "center" }}>
      <ButtonGroup.Root style={{ alignSelf: "center" }} accessibilityLabel="Actions">
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
        <Button variant="outline" disabled>
          Snooze
        </Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root style={{ alignSelf: "center" }} accessibilityLabel="Clipboard">
        <Button variant="secondary">Copy</Button>
        <ButtonGroup.Separator />
        <Button variant="secondary">Paste</Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root style={{ alignSelf: "center" }} accessibilityLabel="Export formats">
        <ButtonGroup.Text>Export</ButtonGroup.Text>
        <Button variant="outline">CSV</Button>
        <Button variant="outline">JSON</Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root style={{ alignSelf: "center" }} orientation="vertical" accessibilityLabel="Reorder">
        <Button variant="outline">Move up</Button>
        <Button variant="outline">Move down</Button>
      </ButtonGroup.Root>
    </View>
  )
}
