import { InputOTP } from "../adapters/input-otp"
export default function Example() {
  return (
    <div className="space-y-6">
      {["Empty", "Partial", "Filled", "Disabled", "Invalid"].map((state) => (
        <section key={state} data-audit-case={state}>
          <InputOTP.Root
            maxLength={6}
            aria-label={state}
            defaultValue={state === "Partial" ? "123" : state === "Empty" ? "" : "123456"}
            disabled={state === "Disabled"}
            aria-invalid={state === "Invalid" || undefined}
          >
            <InputOTP.Group>
              {[0, 1, 2].map((index) => (
                <InputOTP.Slot key={index} index={index} aria-invalid={state === "Invalid" || undefined} />
              ))}
            </InputOTP.Group>
            <InputOTP.Separator />
            <InputOTP.Group>
              {[3, 4, 5].map((index) => (
                <InputOTP.Slot key={index} index={index} aria-invalid={state === "Invalid" || undefined} />
              ))}
            </InputOTP.Group>
          </InputOTP.Root>
        </section>
      ))}
    </div>
  )
}
