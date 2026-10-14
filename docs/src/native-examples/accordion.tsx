import { Accordion } from "@multicomma/arkcn-react-native/ui/accordion"
export default function AccordionExample() {
  return (
    <Accordion.Root collapsible defaultValue={["item-1"]} style={{ width: 384, maxWidth: "100%" }}>
      <Accordion.Item value="item-1">
        <Accordion.ItemTrigger>Is it accessible?</Accordion.ItemTrigger>
        <Accordion.ItemContent>Yes. It follows the WAI-ARIA design pattern.</Accordion.ItemContent>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.ItemTrigger>Is it styled?</Accordion.ItemTrigger>
        <Accordion.ItemContent>Yes, with sensible defaults you can override.</Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  )
}
