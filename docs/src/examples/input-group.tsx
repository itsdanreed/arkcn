import { SearchIcon } from "lucide-react"
import { InputGroup } from "@/components/ui/input-group"

export default function InputGroupExample() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <InputGroup.Root>
        <InputGroup.Addon>
          <SearchIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search…" />
      </InputGroup.Root>
      <InputGroup.Root>
        <InputGroup.Addon>
          <InputGroup.Text>https://</InputGroup.Text>
        </InputGroup.Addon>
        <InputGroup.Input placeholder="example.com" />
      </InputGroup.Root>
    </div>
  )
}
