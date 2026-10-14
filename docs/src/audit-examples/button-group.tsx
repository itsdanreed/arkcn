import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
export default function Example() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(["horizontal", "vertical"] as const).flatMap((orientation) =>
        (["default", "outline", "secondary", "ghost"] as const).map((variant) => (
          <section key={`${orientation}-${variant}`} data-audit-case={`${orientation}-${variant}`}>
            <ButtonGroup.Root orientation={orientation}>
              <Button variant={variant}>First</Button>
              <Button variant={variant} aria-expanded>
                Second
              </Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
            </ButtonGroup.Root>
          </section>
        ))
      )}
      <section data-audit-case="input">
        <ButtonGroup.Root>
          <ButtonGroup.Text>$</ButtonGroup.Text>
          <Input.Root aria-label="Amount" placeholder="Amount" className="w-24" />
          <Button variant="outline">Save</Button>
        </ButtonGroup.Root>
      </section>
      <section data-audit-case="separator">
        <ButtonGroup.Root>
          <Button>First</Button>
          <ButtonGroup.Separator />
          <Button>Second</Button>
        </ButtonGroup.Root>
      </section>
    </div>
  )
}
