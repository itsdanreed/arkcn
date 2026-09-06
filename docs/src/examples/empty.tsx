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
        <Button variant="outline">Compose</Button>
      </EmptyContent>
    </Empty>
  )
}
