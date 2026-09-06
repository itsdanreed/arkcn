import * as React from "react"
import { CheckIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/components/ui/chat"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useFilter,
  useListCollection,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ChatUser } from "./data"

type User = Omit<ChatUser, "messages">

export function NewChat({
  users,
  open,
  onOpenChange,
}: {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selected, setSelected] = React.useState<User[]>([])
  const { contains } = useFilter({ sensitivity: "base" })
  const { collection, filter } = useListCollection<User>({
    initialItems: users,
    itemToString: (u) => `${u.fullName} ${u.username}`,
    itemToValue: (u) => u.id,
    filter: contains,
  })

  const toggle = (user: User) =>
    setSelected((prev) => (prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]))

  return (
    <Dialog
      open={open}
      onOpenChange={({ open }) => {
        onOpenChange(open)
        if (!open) setSelected([])
      }}
    >
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-h-6 text-sm text-muted-foreground">To:</span>
            {selected.map((user) => (
              <Badge key={user.id}>
                {user.fullName}
                <button
                  type="button"
                  className="ms-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => toggle(user)}
                  aria-label={`Remove ${user.fullName}`}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Command
            collection={collection}
            value={[]}
            onSelect={({ value }) => {
              const user = users.find((u) => u.id === value)
              if (user) toggle(user)
            }}
            className="rounded-lg border"
          >
            <CommandInput placeholder="Search people..." onValueChange={filter} />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup>
                {collection.items.map((user) => {
                  const isSelected = selected.some((u) => u.id === user.id)
                  return (
                    <CommandItem
                      key={user.id}
                      item={user}
                      className="justify-between **:data-[slot=command-item-indicator]:hidden"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={user.profile} alt={user.fullName} />
                          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.fullName}</span>
                          <span className="text-xs text-muted-foreground">{user.username}</span>
                        </div>
                      </div>
                      {isSelected && <CheckIcon className="size-4" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <Button
            disabled={selected.length === 0}
            onClick={() => {
              toast.success(`Starting a chat with ${selected.map((u) => u.fullName).join(", ")}`)
              onOpenChange(false)
              setSelected([])
            }}
          >
            Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
