import { useState } from "react"
import { Direction, useDirection } from "@/components/ui/direction"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
function ReadDirection() {
  const dir = useDirection()
  return (
    <div dir={dir} data-slot="direction-example" className="space-y-2">
      <span data-slot="direction-value">{dir}</span>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link href="#home">Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Settings</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}
export default function Example() {
  const [dir, setDir] = useState<"ltr" | "rtl">("rtl")
  return (
    <div className="space-y-6">
      <Button onClick={() => setDir(dir === "rtl" ? "ltr" : "rtl")}>Toggle direction</Button>
      <section data-audit-case="default">
        <ReadDirection />
      </section>
      <section data-audit-case="provider">
        <Direction.Root dir={dir}>
          <ReadDirection />
          <Direction.Root dir="ltr">
            <ReadDirection />
          </Direction.Root>
        </Direction.Root>
      </section>
    </div>
  )
}
