import { useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"

function Picker({
  label,
  values,
  initial,
  disabled,
  small = false,
}: {
  label: string
  values: string[]
  initial: string
  disabled: boolean
  small?: boolean
}) {
  return (
    <Select defaultValue={initial} disabled={disabled}>
      <SelectTrigger size={small ? "sm" : "default"} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {values.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
export default function Example() {
  const [disabled, setDisabled] = useState(false)
  return (
    <div className="space-y-4">
      <Button variant="outline" aria-pressed={disabled} onClick={() => setDisabled(!disabled)}>
        Disabled
      </Button>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">Match</span>
        <Picker label="Match all or any" values={["all", "any"]} initial="all" disabled={disabled} small />
        <span className="text-sm text-muted-foreground">of the following</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Picker
          label="Field"
          values={["Plan", "Seats", "Name", "Is active", "Signed up"]}
          initial="Plan"
          disabled={disabled}
        />
        <Picker label="Operator" values={["is", "is not", "is any of"]} initial="is" disabled={disabled} />
        <Picker label="Value" values={["Free", "Pro"]} initial="Pro" disabled={disabled} />
        <Button variant="ghost" size="icon-xs" disabled={disabled} aria-label="Remove condition">
          <XIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Picker label="Field" values={["Plan", "Seats", "Name"]} initial="Seats" disabled={disabled} />
        <Picker
          label="Operator"
          values={["is greater than", "is less than", "is between"]}
          initial="is greater than"
          disabled={disabled}
        />
        <div className="w-24">
          <Input type="number" aria-label="Value" defaultValue="5" disabled={disabled} />
        </div>
        <Button variant="ghost" size="icon-xs" disabled={disabled} aria-label="Remove condition">
          <XIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button variant="ghost" size="sm" disabled={disabled}>
          <PlusIcon />
          Add condition
        </Button>
        <Button variant="ghost" size="sm" disabled={disabled}>
          Add a nested group
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Select, Input, and Button references only. Shadcn has no recursive query builder.
      </p>
    </div>
  )
}
