import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AvatarExample() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/itsdanreed.png" alt="Dan Reed" />
        <AvatarFallback>DR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    </div>
  )
}
