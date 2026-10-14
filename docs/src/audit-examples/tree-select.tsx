import { TreeSelect, createTreeCollection } from "@/components/ui/tree-select"
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
const org = createTreeCollection({
  rootNode: {
    value: "root",
    label: "Root",
    children: [
      {
        value: "eng",
        label: "Engineering",
        children: [
          { value: "ava", label: "Ava Chen" },
          { value: "noah", label: "Noah Patel" },
        ],
      },
      { value: "design", label: "Design" },
    ],
  },
})
const empty = createTreeCollection({ rootNode: { value: "root", label: "Root", children: [] } })
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="tree-select-content"]')
  return (
    <div className="space-y-5">
      {["default", "small", "empty", "disabled", "invalid", "readonly"].map((state) => (
        <section data-audit-case={state} key={state} className="w-72 max-w-full">
          <TreeSelect.Root
            collection={collection}
            defaultValue={state === "empty" ? [] : ["Engineering"]}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
          >
            <TreeSelect.Trigger aria-label={state} size={state === "small" ? "sm" : "default"}>
              <TreeSelect.Value placeholder="Select team" />
              <TreeSelect.Indicator />
            </TreeSelect.Trigger>
          </TreeSelect.Root>
        </section>
      ))}
      {["chips", "disabled-chips", "readonly-chips"].map((state) => (
        <section key={state} data-audit-case={state}>
          <TreeSelect.Root
            collection={collection}
            multiple
            defaultValue={["Engineering", "Design"]}
            disabled={state === "disabled-chips"}
            readOnly={state === "readonly-chips"}
          >
            <TreeSelect.Chips />
          </TreeSelect.Root>
        </section>
      ))}
      <section data-audit-case="popup" className="w-72 max-w-full">
        <TreeSelect.Root collection={empty}>
          <TreeSelect.Trigger aria-label="Empty tree">
            <TreeSelect.Value placeholder="Select team" />
            <TreeSelect.Indicator />
          </TreeSelect.Trigger>
          <TreeSelect.Content>
            <TreeSelect.Search aria-label="Find team" placeholder="Find team" />
            <TreeSelect.Empty>No results</TreeSelect.Empty>
          </TreeSelect.Content>
        </TreeSelect.Root>
      </section>
      <section data-audit-interaction="tree" className="w-72 max-w-full">
        <TreeSelect.Root collection={org} multiple defaultValue={["ava", "noah"]} defaultExpandedValue={["eng"]}>
          <TreeSelect.Trigger aria-label="People">
            <TreeSelect.Chips placeholder="Add people" />
            <TreeSelect.ClearTrigger />
            <TreeSelect.Indicator />
          </TreeSelect.Trigger>
          <TreeSelect.Content>
            <TreeSelect.Search aria-label="Find people" placeholder="Find people" />
            <TreeSelect.Tree />
            <TreeSelect.Empty />
          </TreeSelect.Content>
        </TreeSelect.Root>
      </section>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
