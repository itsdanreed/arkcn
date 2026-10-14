import { Toast, createToaster } from "@/components/ui/toast"
import { CircleCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
const toaster = createToaster({ placement: "bottom-end", duration: 6000, removeDelay: 500, gap: 12, overlap: true })
export default function ToastExample() {
  return (
    <>
      <Button
        onClick={() =>
          toaster.create({
            title: "Changes saved",
            description: "Your preferences have been updated.",
            type: "success",
            action: { label: "Undo", onClick: () => toaster.create({ title: "Changes undone", type: "info" }) },
          })
        }
      >
        Show toast
      </Button>
      <Toast.Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root asChild>
            <section>
              <Toast.Content>
                <CircleCheckIcon className="size-4 shrink-0" aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Toast.Title>{toast.title}</Toast.Title>
                  <Toast.Description>{toast.description}</Toast.Description>
                </div>
                {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
                <Toast.CloseTrigger aria-label="Dismiss notification" />
              </Toast.Content>
            </section>
          </Toast.Root>
        )}
      </Toast.Toaster>
    </>
  )
}
