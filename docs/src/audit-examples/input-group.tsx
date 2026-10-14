import { InputGroup } from "@/components/ui/input-group"
import { SearchIcon, PlusIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="grid max-w-xl gap-4">
      {["Default", "Invalid", "Disabled"].map((state) => (
        <section key={state} data-audit-case={state}>
          <InputGroup.Root>
            <InputGroup.Addon>
              <SearchIcon />
            </InputGroup.Addon>
            <InputGroup.Input
              aria-label={state}
              placeholder={state}
              aria-invalid={state === "Invalid" || undefined}
              disabled={state === "Disabled"}
            />
            <InputGroup.Addon align="inline-end">
              <InputGroup.Trigger disabled={state === "Disabled"}>Search</InputGroup.Trigger>
            </InputGroup.Addon>
          </InputGroup.Root>
        </section>
      ))}
      {(["block-start", "block-end"] as const).map((align) => (
        <section key={align} data-audit-case={align}>
          <InputGroup.Root>
            <InputGroup.Textarea aria-label={align} placeholder="Write a message" />
            <InputGroup.Addon align={align}>
              <InputGroup.Text>Message</InputGroup.Text>
              <InputGroup.Trigger className="ml-auto" aria-label="Add">
                <PlusIcon />
              </InputGroup.Trigger>
            </InputGroup.Addon>
          </InputGroup.Root>
        </section>
      ))}
    </div>
  )
}
