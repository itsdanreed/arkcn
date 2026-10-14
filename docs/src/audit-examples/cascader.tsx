import CascaderInteraction from "../examples/cascader"
import { Cascader, createTreeCollection } from "@/components/ui/cascader"
import { useAuditMotion } from "../audit-motion"
const collection = createTreeCollection({
  rootNode: {
    value: "root",
    label: "Root",
    children: [
      { value: "Engineering", label: "Engineering" },
      { value: "Design", label: "Design" },
    ],
  },
})
const empty = createTreeCollection({ rootNode: { value: "root", label: "Root", children: [] } })
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="cascader-content"]')
  return (
    <div className="space-y-5">
      {["default", "small", "empty", "disabled", "invalid", "readonly"].map((state) => (
        <section data-audit-case={state} key={state} className="w-72 max-w-full">
          <Cascader.Root
            collection={collection}
            defaultValue={state === "empty" ? [] : ["Engineering"]}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <Cascader.Trigger aria-label={state} size={state === "small" ? "sm" : "default"}>
              <Cascader.Value placeholder="Select team" />
              <Cascader.Indicator />
            </Cascader.Trigger>
          </Cascader.Root>
        </section>
      ))}
      <section data-audit-case="popup" className="w-72 max-w-full">
        <Cascader.Root collection={empty}>
          <Cascader.Trigger aria-label="Empty tree">
            <Cascader.Value placeholder="Select team" />
            <Cascader.Indicator />
          </Cascader.Trigger>
          <Cascader.Content>
            <Cascader.Search aria-label="Find team" placeholder="Find team" />
            <Cascader.Empty>No results</Cascader.Empty>
          </Cascader.Content>
        </Cascader.Root>
      </section>
      <CascaderInteraction />
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
