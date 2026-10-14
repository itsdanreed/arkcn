import { PinInput } from "@/components/ui/pin-input"
export default function Example() {
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid", "masked"].map((state) => (
        <section key={state} data-audit-case={state}>
          <PinInput.Root
            count={4}
            defaultValue={state === "empty" ? [] : ["1", "2", "3", "4"]}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            mask={state === "masked"}
          >
            <PinInput.Label>{state} code</PinInput.Label>
            <PinInput.Control>
              {[0, 1, 2, 3].map((index) => (
                <PinInput.Input key={index} index={index} />
              ))}
            </PinInput.Control>
            <PinInput.HiddenInput />
          </PinInput.Root>
        </section>
      ))}
    </div>
  )
}
