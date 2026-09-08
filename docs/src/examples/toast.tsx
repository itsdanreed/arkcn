import { Toast, createToaster } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
const toaster = createToaster({ placement: "bottom-end", duration: 6000 })
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
              <Toast.Title>{toast.title}</Toast.Title>
              <Toast.Description>{toast.description}</Toast.Description>
              {toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
              <Toast.CloseTrigger aria-label="Dismiss notification">×</Toast.CloseTrigger>
            </section>
          </Toast.Root>
        )}
      </Toast.Toaster>
    </>
  )
}
