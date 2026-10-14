import { Avatar, useAvatar } from "@/components/ui/avatar"
import { CheckIcon, UsersIcon } from "lucide-react"
const portrait =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23999'/%3E%3Ccircle cx='20' cy='16' r='8' fill='%23eee'/%3E%3Cpath d='M4 40a16 16 0 0 1 32 0' fill='%23eee'/%3E%3C/svg%3E"
function ProviderAvatar({ size }: { size: "sm" | "default" | "lg" }) {
  const value = useAvatar()
  return (
    <Avatar.RootProvider value={value} size={size}>
      <Avatar.Fallback>CD</Avatar.Fallback>
    </Avatar.RootProvider>
  )
}
export default function Example() {
  return (
    <div className="space-y-6">
      {(["sm", "default", "lg"] as const).map((size) => (
        <section key={size} data-audit-case={size} className="flex items-center gap-6">
          <Avatar.Root size={size}>
            <Avatar.Image src={portrait} alt="Portrait" />
            <Avatar.Fallback>AB</Avatar.Fallback>
            <Avatar.Badge>
              <CheckIcon />
            </Avatar.Badge>
          </Avatar.Root>
          <Avatar.Root size={size}>
            <Avatar.Image src="data:image/png;base64,broken" alt="Unavailable portrait" />
            <Avatar.Fallback>AB</Avatar.Fallback>
            <Avatar.Badge>
              <CheckIcon />
            </Avatar.Badge>
          </Avatar.Root>
          <Avatar.Group>
            <Avatar.Root size={size}>
              <Avatar.Fallback>AB</Avatar.Fallback>
            </Avatar.Root>
            <ProviderAvatar size={size} />
            <Avatar.GroupCount>+3</Avatar.GroupCount>
            <Avatar.GroupCount>
              <UsersIcon />
            </Avatar.GroupCount>
          </Avatar.Group>
        </section>
      ))}
    </div>
  )
}
