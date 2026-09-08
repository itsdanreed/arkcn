import { toast } from "sonner"
import { InboxIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"

export default function EmptyExample() {
  return (
    <Empty.Root className="w-96">
      <Empty.Header>
        <Empty.Media variant="icon">
          <InboxIcon />
        </Empty.Media>
        <Empty.Title>No messages</Empty.Title>
        <Empty.Description>When someone writes to you, it shows up here.</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button
          variant="outline"
          onClick={() => toast("Compose selected", { description: "Connect this action to your message composer." })}
        >
          Compose
        </Button>
      </Empty.Content>
    </Empty.Root>
  )
}
