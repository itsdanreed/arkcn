import { Textarea } from "../adapters/textarea"
export default function Example() {
  return (
    <div className="grid max-w-xl gap-4">
      {["Default", "Filled", "Invalid", "Disabled", "Read only"].map((state) => (
        <section key={state} data-audit-case={state}>
          <Textarea.Root
            aria-label={state}
            placeholder={state}
            defaultValue={state === "Filled" || state === "Read only" ? "Example value" : undefined}
            aria-invalid={state === "Invalid" || undefined}
            disabled={state === "Disabled"}
            readOnly={state === "Read only"}
          />
        </section>
      ))}
    </div>
  )
}
