import { Avatar } from "@/components/ui/avatar"

export default function AvatarExample() {
  return (
    <div className="flex items-center gap-3">
      <Avatar.Root>
        <Avatar.Image src="https://github.com/itsdanreed.png" alt="Dan Reed" />
        <Avatar.Fallback>DR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>AM</Avatar.Fallback>
      </Avatar.Root>
    </div>
  )
}
