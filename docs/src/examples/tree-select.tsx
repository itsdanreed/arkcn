import * as React from "react"
import {
  TreeSelect,
  TreeSelectChips,
  TreeSelectClearTrigger,
  TreeSelectContent,
  TreeSelectIndicator,
  TreeSelectSearch,
  TreeSelectTree,
  TreeSelectTrigger,
  createTreeCollection,
} from "@/components/ui/tree-select"

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
    <TreeSelect
      collection={org}
      multiple
      value={value}
      onValueChange={({ value }) => setValue(value)}
      defaultExpandedValue={["eng"]}
    >
      <TreeSelectTrigger className="w-80" aria-label="People">
        <TreeSelectChips placeholder="Add people or teams" />
        <TreeSelectClearTrigger />
        <TreeSelectIndicator />
      </TreeSelectTrigger>
      <TreeSelectContent>
        <TreeSelectSearch placeholder="Find people" />
        <TreeSelectTree />
      </TreeSelectContent>
    </TreeSelect>
  )
}
