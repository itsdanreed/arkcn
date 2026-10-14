import { Editable } from "@/components/ui/editable"
export default function Example() {
  return (
    <div className="space-y-5">
      {(["default", "disabled", "empty"] as const).map((state) => (
        <section key={state} data-audit-case={state}>
          <Editable.Root
            defaultValue={state === "empty" ? "" : "Project title"}
            placeholder="Enter a title"
            disabled={state === "disabled"}
          >
            <Editable.Label>{state} title</Editable.Label>
            <Editable.Area>
              <Editable.Input data-audit-part="input" />
              <Editable.Preview data-audit-part="preview" />
            </Editable.Area>
          </Editable.Root>
        </section>
      ))}
    </div>
  )
}
