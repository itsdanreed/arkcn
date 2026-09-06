import { ClockIcon, MousePointerClickIcon, TrendingDownIcon, UserIcon } from "lucide-react"
import { Area, AreaChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { analyticsData, devices, referrers } from "./data"
import { StatCard } from "./stat-card"

const config = {
  clicks: { label: "Clicks", color: "var(--primary)" },
  uniques: { label: "Unique visitors", color: "var(--muted-foreground)" },
} satisfies ChartConfig

function AnalyticsChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-75 w-full">
      <AreaChart data={analyticsData}>
        <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="clicks"
          stroke="var(--color-clicks)"
          fill="var(--color-clicks)"
          fillOpacity={0.15}
        />
        <Area
          type="monotone"
          dataKey="uniques"
          stroke="var(--color-uniques)"
          fill="var(--color-uniques)"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.name} className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 truncate text-xs text-muted-foreground">{item.name}</div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className={cn("h-2.5 rounded-full", barClass)}
                style={{ width: `${Math.round((item.value / max) * 100)}%` }}
              />
            </div>
          </div>
          <div className="ps-2 text-xs font-medium tabular-nums">{valueFormatter(item.value)}</div>
        </li>
      ))}
    </ul>
  )
}

export function Analytics() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>Weekly clicks and unique visitors</CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <AnalyticsChart />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clicks" value="1,248" hint="+12.4% vs last week" icon={<MousePointerClickIcon />} />
        <StatCard title="Unique Visitors" value="832" hint="+5.8% vs last week" icon={<UserIcon />} />
        <StatCard title="Bounce Rate" value="42%" hint="-3.2% vs last week" icon={<TrendingDownIcon />} />
        <StatCard title="Avg. Session" value="3m 24s" hint="+18s vs last week" icon={<ClockIcon />} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Referrers</CardTitle>
            <CardDescription>Top sources driving traffic</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList items={referrers} barClass="bg-primary" valueFormatter={(n) => `${n}`} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>How users access your app</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList items={devices} barClass="bg-muted-foreground" valueFormatter={(n) => `${n}%`} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
