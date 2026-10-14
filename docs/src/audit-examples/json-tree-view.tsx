import { useState } from "react"
import { LocaleProvider } from "@ark-ui/react"
import { Button } from "@/components/ui/button"
import { JsonTreeView } from "@/components/ui/json-tree-view"
const data = {
  name: "arkcn",
  enabled: true,
  options: {
    retries: 3,
    missing: null,
    description: "A long JSON value that should stay on a single row without overlapping its neighbors.",
  },
}
export default function Example() {
  const [rtl, setRtl] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
        RTL
      </Button>
      <LocaleProvider locale={rtl ? "ar" : "en"}>
        <JsonTreeView.Root data={data} defaultExpandedDepth={2}>
          <JsonTreeView.Tree aria-label="JSON data" indentGuide />
        </JsonTreeView.Root>
      </LocaleProvider>
    </div>
  )
}
