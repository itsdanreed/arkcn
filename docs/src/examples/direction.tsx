import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Direction } from "@/components/ui/direction"

function Crumbs() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Settings</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}

export default function DirectionExample() {
  return (
    <div className="flex flex-col gap-4">
      <Crumbs />
      <div dir="rtl">
        <Direction.Root dir="rtl">
          <Crumbs />
        </Direction.Root>
      </div>
    </div>
  )
}
