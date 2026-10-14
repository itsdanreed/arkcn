import { Calendar } from "@/components/ui/calendar"
const month = new Date(2026, 9, 1)
const today = new Date(2026, 9, 13)
export default function Example() {
  return (
    <div className="flex flex-wrap gap-8">
      <section data-audit-case="single">
        <Calendar.Root
          mode="single"
          month={month}
          today={today}
          selected={new Date(2026, 9, 15)}
          disabled={{ dayOfWeek: [0, 6] }}
          startMonth={month}
          endMonth={month}
          className="rounded-lg border"
        />
      </section>
      <section data-audit-case="range">
        <Calendar.Root
          mode="range"
          month={month}
          today={today}
          selected={{ from: new Date(2026, 9, 12), to: new Date(2026, 9, 16) }}
          className="rounded-lg border"
        />
      </section>
      <section data-audit-case="dropdown">
        <Calendar.Root
          mode="single"
          month={month}
          today={today}
          captionLayout="dropdown"
          className="rounded-lg border"
        />
      </section>
    </div>
  )
}
