import { TagsInput } from "@/components/ui/tags-input"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid", "wrapping"].map((state) => (
        <section key={state} data-audit-case={state}>
          <TagsInput.Root
            defaultValue={
              state === "empty"
                ? []
                : state === "wrapping"
                  ? ["react", "typescript", "accessibility", "design systems", "components"]
                  : ["react", "ark-ui"]
            }
            disabled={state === "disabled"}
            invalid={state === "invalid"}
          >
            <TagsInput.Label>{state} topics</TagsInput.Label>
            <TagsInput.Control data-audit-part="surface">
              <TagsInput.Context>
                {(api) =>
                  api.value.map((value, index) => (
                    <TagsInput.Item key={index} index={index} value={value}>
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
            <TagsInput.HiddenInput />
          </TagsInput.Root>
        </section>
      ))}
    </div>
  )
}
