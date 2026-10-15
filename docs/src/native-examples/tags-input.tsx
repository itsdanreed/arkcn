import { TagsInput } from "@multicomma/arkcn-react-native/ui/tags-input"

export default function TagsInputExample() {
  return (
    <TagsInput.Root defaultValue={["react", "ark-ui"]} style={{ width: 320, maxWidth: "100%" }}>
      <TagsInput.Label>Topics</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Context>
          {(api) =>
            api.value.map((value, index) => (
              <TagsInput.Item key={`${index}:${value}`} index={index} value={value}>
                <TagsInput.ItemPreview>
                  <TagsInput.ItemText>{value}</TagsInput.ItemText>
                  <TagsInput.ItemDeleteTrigger />
                </TagsInput.ItemPreview>
                <TagsInput.ItemInput />
              </TagsInput.Item>
            ))
          }
        </TagsInput.Context>
        <TagsInput.Input placeholder="Add a topic…" />
      </TagsInput.Control>
    </TagsInput.Root>
  )
}
