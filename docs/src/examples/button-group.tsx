import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
export default function ButtonGroupExample() {
  return (
    <div className="flex flex-col items-center gap-4">
      <ButtonGroup.Root aria-label="Actions">
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
        <Button variant="outline" disabled>
          Snooze
        </Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root aria-label="Clipboard">
        <Button variant="secondary">Copy</Button>
        <ButtonGroup.Separator />
        <Button variant="secondary">Paste</Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root aria-label="Export formats">
        <ButtonGroup.Text>Export</ButtonGroup.Text>
        <Button variant="outline">CSV</Button>
        <Button variant="outline">JSON</Button>
      </ButtonGroup.Root>
      <ButtonGroup.Root orientation="vertical" aria-label="Reorder">
        <Button variant="outline">Move up</Button>
        <Button variant="outline">Move down</Button>
      </ButtonGroup.Root>
    </div>
  )
}
