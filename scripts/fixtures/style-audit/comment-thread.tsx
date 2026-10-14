import { useState } from "react"
import { SendIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Button } from "../ui/button"
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "../ui/input-group"

export default function Example() {
  const [value, setValue] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [invalid, setInvalid] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback>NP</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" aria-pressed={invalid} onClick={() => setInvalid(!invalid)}>
          Invalid
        </Button>
      </div>
      <InputGroup data-audit-part="composer">
        <InputGroupTextarea
          aria-label="Comment"
          placeholder="Write a comment…"
          aria-invalid={invalid || undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputGroupAddon align="block-end">
          <Button variant="ghost" size="sm" onClick={() => setValue("")}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!value.trim()}
            onClick={() => {
              setSubmitted(value.trim())
              setValue("")
            }}
          >
            <SendIcon /> Comment
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <output>{submitted && `Submitted: ${submitted}`}</output>
    </div>
  )
}
