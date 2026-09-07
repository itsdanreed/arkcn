import { toast } from "sonner"
import { InboxIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function EmptyExample() {
  return (
    <Empty className="w-96">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>No messages</EmptyTitle>
        <EmptyDescription>When someone writes to you, it shows up here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          onClick={() => toast("Compose selected", { description: "Connect this action to your message composer." })}
        >
          Compose
        </Button>
      </EmptyContent>
    </Empty>
  )
}
