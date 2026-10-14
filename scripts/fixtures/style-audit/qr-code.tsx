import { Button } from "../ui/button"

export default function Example() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button variant="outline" data-audit-case="default">
        Download SVG
      </Button>
      <Button variant="outline" disabled data-audit-case="disabled">
        Download disabled
      </Button>
      <Button variant="secondary" size="sm" data-audit-case="custom">
        Custom download
      </Button>
    </div>
  )
}
