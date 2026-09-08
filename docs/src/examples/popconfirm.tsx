import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Popconfirm } from "@/components/ui/popconfirm"

export default function PopconfirmExample() {
  return (
    <Popconfirm.Root>
      <Popconfirm.Trigger asChild>
        <Button variant="outline">Delete file</Button>
      </Popconfirm.Trigger>
      <Popconfirm.Content>
        <Popconfirm.Header>
          <Popconfirm.Icon />
          <Popconfirm.Title>Delete this file?</Popconfirm.Title>
          <Popconfirm.Description>It cannot be recovered.</Popconfirm.Description>
        </Popconfirm.Header>
        <Popconfirm.Footer>
          <Popconfirm.CancelTrigger />
          <Popconfirm.ConfirmTrigger onConfirm={() => toast("Deleted")}>Delete</Popconfirm.ConfirmTrigger>
        </Popconfirm.Footer>
      </Popconfirm.Content>
    </Popconfirm.Root>
  )
}
