import { Input } from "../ui/input"
import { Label } from "../ui/label"
export default function Example() {
  return (
    <div className="space-y-5">
      {(["default", "disabled", "empty"] as const).map((state) => (
        <section key={state} data-audit-case={state}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={state}>{state} title</Label>
            <Input
              id={state}
              data-audit-part="input"
              defaultValue={state === "empty" ? "" : "Project title"}
              disabled={state === "disabled"}
              placeholder="Enter a title"
            />
          </div>
        </section>
      ))}
    </div>
  )
}
