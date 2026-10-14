import { useState } from "react"
import { TreeView, createTreeCollection } from "@/components/ui/tree-view"
import { FileIcon } from "lucide-react"
const files = createTreeCollection({
  rootNode: {
    value: "root",
    label: "Root",
    children: [
      { value: "default", label: "app.tsx" },
      { value: "selected", label: "index.css" },
      { value: "disabled", label: "Disabled file", disabled: true },
    ],
  },
})
const checks = createTreeCollection({
  rootNode: {
    value: "root",
    label: "Root",
    children: [
      { value: "checked", label: "Checked" },
      { value: "unchecked", label: "Unchecked" },
      {
        value: "mixed",
        label: "Mixed",
        children: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      },
    ],
  },
})
export default function Example() {
  const [renamed, setRenamed] = useState("")
  return (
    <div className="w-72 max-w-full space-y-5">
      <TreeView.Root
        collection={files}
        defaultSelectedValue={["selected"]}
        canRename={() => true}
        onRenameComplete={({ label }) => setRenamed(label)}
      >
        <TreeView.Label>Files</TreeView.Label>
        <TreeView.Tree>
          {files.rootNode.children.map((node, i) => (
            <TreeView.NodeProvider key={node.value} node={node} indexPath={[i]}>
              <TreeView.Item data-audit-row={node.value}>
                <FileIcon />
                <TreeView.NodeContext>
                  {(state) =>
                    state.renaming ? <TreeView.NodeRenameInput /> : <TreeView.ItemText>{node.label}</TreeView.ItemText>
                  }
                </TreeView.NodeContext>
              </TreeView.Item>
            </TreeView.NodeProvider>
          ))}
        </TreeView.Tree>
      </TreeView.Root>
      <TreeView.Root collection={checks} defaultCheckedValue={["checked", "a"]}>
        <TreeView.Label>Checkboxes</TreeView.Label>
        <div className="flex gap-4">
          {checks.rootNode.children.map((node, i) => (
            <TreeView.NodeProvider key={node.value} node={node} indexPath={[i]}>
              <TreeView.NodeCheckbox data-audit-check={node.value} aria-label={node.label} />
            </TreeView.NodeProvider>
          ))}
        </div>
      </TreeView.Root>
      <output aria-label="Renamed file">{renamed}</output>
    </div>
  )
}
