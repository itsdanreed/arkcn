import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Chart, type ChartConfig } from "@/components/ui/chart"
const config = {
  desktop: { label: "Desktop", color: "var(--chart-2)" },
  mobile: { label: "Mobile", color: "var(--chart-4)" },
} satisfies ChartConfig
const data = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
]
const payload = [
  {
    graphicalItemId: "desktop",
    name: "desktop",
    dataKey: "desktop",
    value: 186,
    color: "var(--chart-2)",
    payload: data[0],
  },
  {
    graphicalItemId: "mobile",
    name: "mobile",
    dataKey: "mobile",
    value: 80,
    color: "var(--chart-4)",
    payload: data[0],
  },
]
export default function Example() {
  return (
    <div className="space-y-6">
      <section data-audit-case="bars">
        <Chart.Root config={config} className="h-48 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <Chart.Tooltip content={<Chart.TooltipContent />} />
            <Chart.Legend content={<Chart.LegendContent />} />
            <Bar isAnimationActive={false} dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar isAnimationActive={false} dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </Chart.Root>
      </section>
      {(["dot", "line", "dashed"] as const).map((indicator) => (
        <section key={indicator} data-audit-case={indicator}>
          <Chart.Root config={config} className="h-24 w-full">
            <div className="flex items-start gap-4">
              <Chart.TooltipContent active payload={payload} indicator={indicator} label="January" />
              <Chart.TooltipContent active payload={payload.slice(0, 1)} indicator={indicator} label="January" />
              <Chart.TooltipContent active payload={payload} hideLabel hideIndicator />
              <Chart.LegendContent
                payload={payload.map((item) => ({ ...item, value: item.name }))}
                verticalAlign="top"
              />
            </div>
          </Chart.Root>
        </section>
      ))}
    </div>
  )
}
