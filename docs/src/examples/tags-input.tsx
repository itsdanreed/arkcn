import { TagsInput } from "@/components/ui/tags-input"

export default function TagsInputExample() {
  return (
    <TagsInput.Root defaultValue={["react", "ark-ui"]} className="w-80">
      <TagsInput.Label>Topics</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Context>
          {(api) =>
            api.value.map((value, index) => (
              <TagsInput.Item key={index} index={index} value={value}>
                <TagsInput.ItemPreview>
                  <TagsInput.ItemText>{value}</TagsInput.ItemText>
                  <TagsInput.ItemDeleteTrigger />
                </TagsInput.ItemPreview>
              </TagsInput.Item>
            ))
          }
        </TagsInput.Context>
        <TagsInput.Input placeholder="Add a topic…" />
      </TagsInput.Control>
    </TagsInput.Root>
  )
}
