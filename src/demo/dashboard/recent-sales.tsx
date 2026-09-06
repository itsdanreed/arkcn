import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { recentSales } from "./data"

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale, index) => (
        <div key={sale.email} className="flex items-center gap-4">
          <Avatar className="size-9 border">
            <AvatarImage src={`/avatars/0${index + 1}.png`} alt={sale.name} />
            <AvatarFallback>{sale.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-wrap items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-none font-medium">{sale.name}</p>
              <p className="text-sm text-muted-foreground">{sale.email}</p>
            </div>
            <div className="font-medium">{sale.amount}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
