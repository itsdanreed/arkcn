import * as React from "react"
import { TreeSelect, createTreeCollection } from "@/components/ui/tree-select"

const org = createTreeCollection({
  rootNode: {
    value: "root",
    label: "Company",
    children: [
      {
        value: "eng",
        label: "Engineering",
        children: [
          { value: "ava", label: "Ava Chen" },
          { value: "noah", label: "Noah Patel" },
        ],
      },
      {
        value: "design",
        label: "Design",
        children: [
          { value: "ella", label: "Ella Novak" },
          { value: "omar", label: "Omar Haddad" },
        ],
      },
    ],
  },
})

export default function TreeSelectExample() {
  const [value, setValue] = React.useState<string[]>(["ava", "noah"])
  return (
    <TreeSelect.Root
      collection={org}
      multiple
      value={value}
      onValueChange={({ value }) => setValue(value)}
      defaultExpandedValue={["eng"]}
    >
      <TreeSelect.Trigger className="w-80" aria-label="People">
        <TreeSelect.Chips placeholder="Add people or teams" />
        <TreeSelect.ClearTrigger />
        <TreeSelect.Indicator />
      </TreeSelect.Trigger>
      <TreeSelect.Content>
        <TreeSelect.Search placeholder="Find people" />
        <TreeSelect.Tree />
      </TreeSelect.Content>
    </TreeSelect.Root>
  )
}
