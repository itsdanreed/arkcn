import { MailPlusIcon, UserPlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateUsers } from "./data"
import { UsersDialogs } from "./dialogs"
import { UsersProvider, useUsers } from "./users-provider"
import { UsersTable } from "./users-table"

const users = generateUsers(500)

function UsersPrimaryButtons() {
  const { setOpen } = useUsers()
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpen("invite")}>
        Invite User <MailPlusIcon />
      </Button>
      <Button onClick={() => setOpen("add")}>
        Add User <UserPlusIcon />
      </Button>
    </div>
  )
}

/** Demo users page. */
export function UsersPage() {
  return (
    <UsersProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Members</h2>
            <p className="text-muted-foreground">Manage the people in your workspace and their roles.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={users} />
      </div>
      <UsersDialogs />
    </UsersProvider>
  )
}
