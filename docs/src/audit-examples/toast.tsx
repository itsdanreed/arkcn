import { Toast, createToaster } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { CircleCheckIcon } from "lucide-react"

const toaster = createToaster({ placement: "bottom-end", duration: Infinity })
const description =
  "Your preferences have been updated. This notification has a longer description to check stacks with different heights."
export default function Example() {
  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => toaster.create({ title: "Saved", type: "success" })}>Short toast</Button>
        <Button onClick={() => toaster.create({ title: "Changes saved", description, type: "success" })}>
          Long toast
        </Button>
        <Button variant="outline" onClick={() => toaster.dismiss()}>
          Dismiss all
        </Button>
      </div>
      <Toast.Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Content>
              <CircleCheckIcon className="size-4 shrink-0" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Toast.Title>{toast.title}</Toast.Title>
                {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
              </div>
              <Toast.CloseTrigger />
            </Toast.Content>
          </Toast.Root>
        )}
      </Toast.Toaster>
    </>
  )
}
