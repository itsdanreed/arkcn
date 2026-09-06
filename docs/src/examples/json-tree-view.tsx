import { JsonTreeView } from "@/components/ui/json-tree-view"

const data = {
  name: "arkcn",
  version: "0.1.2",
  private: false,
  peers: ["react", "@ark-ui/react", "tailwindcss"],
  registry: { items: 113, css: 1 },
}

export default function JsonTreeViewExample() {
  return <JsonTreeView data={data} defaultExpandedDepth={2} className="w-80" />
}
