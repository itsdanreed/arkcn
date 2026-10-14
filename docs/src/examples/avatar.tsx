import { Avatar } from "@/components/ui/avatar"

export default function AvatarExample() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar.Root>
        <Avatar.Image src="https://github.com/itsdanreed.png" alt="Dan Reed" />
        <Avatar.Fallback>DR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>AM</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Group>
        <Avatar.Root>
          <Avatar.Fallback>DR</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Fallback>AM</Avatar.Fallback>
          <Avatar.Badge />
        </Avatar.Root>
        <Avatar.GroupCount>+3</Avatar.GroupCount>
      </Avatar.Group>
    </div>
  )
}
