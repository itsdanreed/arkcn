import { SearchIcon } from "lucide-react"
import { InputGroup } from "@/components/ui/input-group"
export default function InputGroupExample() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-3">
      <InputGroup.Root>
        <InputGroup.Addon aria-label="Focus search">
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input aria-label="Search" placeholder="Search…" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text>https://</InputGroup.Text>
        </InputGroup.Addon>
        <InputGroup.Input aria-label="Website" placeholder="example.com" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Input aria-label="Email" placeholder="Email address" aria-invalid />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Text>Required</InputGroup.Text>
        </InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Input aria-label="Disabled input" placeholder="Disabled" disabled />
        <InputGroup.Addon align="inline-end">
          <SearchIcon />
        </InputGroup.Addon>
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Textarea aria-label="Message" placeholder="Write a message…" />
        <InputGroup.Addon align="block-end">
          <InputGroup.Trigger>Send</InputGroup.Trigger>
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  )
}
