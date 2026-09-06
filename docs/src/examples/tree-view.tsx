import {
  TreeView,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchControl,
  TreeViewBranchIndicator,
  TreeViewBranchText,
  TreeViewBranchTrigger,
  TreeViewItem,
  TreeViewItemText,
  TreeViewNodeProvider,
  TreeViewTree,
  createTreeCollection,
} from "@/components/ui/tree-view"

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
    <TreeViewNodeProvider node={node} indexPath={indexPath}>
      {node.children ? (
        <TreeViewBranch>
          <TreeViewBranchControl>
            <TreeViewBranchTrigger>
              <TreeViewBranchIndicator />
            </TreeViewBranchTrigger>
            <TreeViewBranchText>{node.label}</TreeViewBranchText>
          </TreeViewBranchControl>
          <TreeViewBranchContent>
            {node.children.map((child, i) => (
              <Nodes key={child.value} node={child} indexPath={[...indexPath, i]} />
            ))}
          </TreeViewBranchContent>
        </TreeViewBranch>
      ) : (
        <TreeViewItem>
          <TreeViewItemText>{node.label}</TreeViewItemText>
        </TreeViewItem>
      )}
    </TreeViewNodeProvider>
  )
}

export default function TreeViewExample() {
  return (
    <TreeView collection={files} defaultExpandedValue={["src"]} className="w-72">
      <TreeViewTree>
        {files.rootNode.children?.map((node, i) => (
          <Nodes key={node.value} node={node} indexPath={[i]} />
        ))}
      </TreeViewTree>
    </TreeView>
  )
}
