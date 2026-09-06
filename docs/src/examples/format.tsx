import { FormatByte, FormatNumber, FormatRelativeTime } from "@/components/ui/format"

export default function FormatExample() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      <span className="text-muted-foreground">Number</span>
      <FormatNumber value={1234567.891} maximumFractionDigits={2} />
      <span className="text-muted-foreground">Currency</span>
      <FormatNumber value={49.99} style="currency" currency="USD" />
      <span className="text-muted-foreground">Bytes</span>
      <FormatByte value={1_450_000} />
      <span className="text-muted-foreground">Relative</span>
      <FormatRelativeTime value={new Date(Date.now() - 3 * 3600 * 1000)} />
    </div>
  )
}
