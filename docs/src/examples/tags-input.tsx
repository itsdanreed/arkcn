import {
  TagsInput,
  TagsInputContext,
  TagsInputControl,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDeleteTrigger,
  TagsInputItemPreview,
  TagsInputItemText,
  TagsInputLabel,
} from "@/components/ui/tags-input"

export default function TagsInputExample() {
  return (
    <TagsInput defaultValue={["react", "ark-ui"]} className="w-80">
      <TagsInputLabel>Topics</TagsInputLabel>
      <TagsInputControl>
        <TagsInputContext>
          {(api) =>
            api.value.map((value, index) => (
              <TagsInputItem key={index} index={index} value={value}>
                <TagsInputItemPreview>
                  <TagsInputItemText>{value}</TagsInputItemText>
                  <TagsInputItemDeleteTrigger />
                </TagsInputItemPreview>
              </TagsInputItem>
            ))
          }
        </TagsInputContext>
        <TagsInputInput placeholder="Add a topic…" />
      </TagsInputControl>
    </TagsInput>
  )
}
