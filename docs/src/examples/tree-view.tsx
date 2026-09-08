import { TreeView, createTreeCollection } from "@/components/ui/tree-view"

type Node = { value: string; label: string; children?: Node[] }

const files = createTreeCollection<Node>({
  rootNode: {
    value: "root",
    label: "",
    children: [
      {
        value: "src",
        label: "src",
        children: [
          { value: "src/app.tsx", label: "app.tsx" },
          { value: "src/index.css", label: "index.css" },
          {
            value: "src/components",
            label: "components",
            children: [{ value: "src/components/button.tsx", label: "button.tsx" }],
          },
        ],
      },
      { value: "package.json", label: "package.json" },
    ],
  },
})

function Nodes({ node, indexPath }: { node: Node; indexPath: number[] }) {
  return (
    <TreeView.NodeProvider node={node} indexPath={indexPath}>
      {node.children ? (
        <TreeView.Branch>
          <TreeView.BranchControl>
            <TreeView.BranchTrigger>
              <TreeView.BranchIndicator />
            </TreeView.BranchTrigger>
            <TreeView.BranchText>{node.label}</TreeView.BranchText>
          </TreeView.BranchControl>
          <TreeView.BranchContent>
            {node.children.map((child, i) => (
              <Nodes key={child.value} node={child} indexPath={[...indexPath, i]} />
            ))}
          </TreeView.BranchContent>
        </TreeView.Branch>
      ) : (
        <TreeView.Item>
          <TreeView.ItemText>{node.label}</TreeView.ItemText>
        </TreeView.Item>
      )}
    </TreeView.NodeProvider>
  )
}

export default function TreeViewExample() {
  return (
    <TreeView.Root collection={files} defaultExpandedValue={["src"]} className="w-72">
      <TreeView.Tree>
        {files.rootNode.children?.map((node, i) => (
          <Nodes key={node.value} node={node} indexPath={[i]} />
        ))}
      </TreeView.Tree>
    </TreeView.Root>
  )
}
