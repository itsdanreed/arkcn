import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon } from "lucide-react"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "destructive"] as const).flatMap((variant) =>
        [false, true].map((icon) => (
          <section key={variant + icon} data-audit-case={variant + icon}>
            <Alert.Root variant={variant}>
              {icon && <InfoIcon />}
              <Alert.Title>Update available</Alert.Title>
              <Alert.Description>
                <p>
                  A newer version is available.{" "}
                  <a href="#details" onClick={(e) => e.preventDefault()}>
                    View details
                  </a>
                </p>
                <p>Your work has been saved.</p>
              </Alert.Description>
              <Alert.Action>
                <Button variant="ghost" size="sm">
                  Undo
                </Button>
              </Alert.Action>
            </Alert.Root>
          </section>
        ))
      )}
    </div>
  )
}
