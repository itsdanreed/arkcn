import { JsonTreeView } from "@/components/ui/json-tree-view"
import { version } from "../registry"

const data = {
  name: "arkcn",
  version,
  private: false,
  peers: ["react", "@ark-ui/react", "tailwindcss"],
  registry: { items: 113, css: 1 },
}

export default function JsonTreeViewExample() {
  return (
    <JsonTreeView.Root data={data} defaultExpandedDepth={2} className="w-80">
      <JsonTreeView.Tree />
    </JsonTreeView.Root>
  )
}
