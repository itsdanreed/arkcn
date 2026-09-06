import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message"

export default function MessageExample() {
  return (
    <MessageGroup className="w-96">
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Ava Chen</MessageHeader>
          Can you take a look at the new docs?
          <MessageFooter>9:12 AM</MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>You</MessageHeader>
          On it.
          <MessageFooter>9:15 AM</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  )
}
