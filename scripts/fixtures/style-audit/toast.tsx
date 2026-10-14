import { Toaster, toast } from "../ui/toast"
import { Button } from "../ui/button"
export default function Example() {
  const description =
    "Your preferences have been updated. This notification has a longer description to check stacks with different heights."
  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => toast.add({ title: "Saved", type: "success" })}>Short toast</Button>
        <Button onClick={() => toast.add({ title: "Changes saved", description, type: "success" })}>Long toast</Button>
        <Button variant="outline" onClick={() => toast.close()}>
          Dismiss all
        </Button>
      </div>
      <Toaster timeout={0} />
    </>
  )
}
