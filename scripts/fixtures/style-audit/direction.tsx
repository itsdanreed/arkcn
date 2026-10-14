import { useState } from "react"
import { Direction, useDirection } from "../adapters/direction"
import { Breadcrumb } from "../adapters/breadcrumb"
import { Button } from "../adapters/button"
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
        <Direction.Root direction={dir}>
          <ReadDirection />
          <Direction.Root direction="ltr">
            <ReadDirection />
          </Direction.Root>
        </Direction.Root>
      </section>
    </div>
  )
}
