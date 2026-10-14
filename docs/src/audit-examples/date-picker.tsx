import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DatePicker, parseDate } from "@/components/ui/date-picker"
import { Portal } from "@/components/ui/portal"
import { useAuditMotion } from "../audit-motion"
function Case({ state }: { state: string }) {
  return (
    <section data-audit-case={state}>
      <DatePicker.Root
        locale="en-US"
        defaultValue={state === "empty" ? [] : [parseDate("2026-10-15")]}
        defaultFocusedValue={parseDate("2026-10-15")}
        disabled={state === "disabled"}
        invalid={state === "invalid"}
        min={parseDate("2026-10-05")}
        className="w-72 max-w-full"
      >
        <DatePicker.Label>{state} date</DatePicker.Label>
        <DatePicker.Control>
          <DatePicker.Input />
          <DatePicker.Trigger aria-label={`Choose ${state} date`} />
          <DatePicker.ClearTrigger aria-label={`Clear ${state} date`} />
        </DatePicker.Control>
        <Portal.Root>
          <DatePicker.Positioner>
            <DatePicker.Content data-audit-popup={state}>
              <DatePicker.View view="day">
                <DatePicker.Context>
                  {(api) => (
                    <>
                      <DatePicker.ViewControl>
                        <DatePicker.PrevTrigger aria-label="Previous month">
                          <ChevronLeftIcon />
                        </DatePicker.PrevTrigger>
                        <DatePicker.ViewTrigger>
                          <DatePicker.RangeText />
                        </DatePicker.ViewTrigger>
                        <DatePicker.NextTrigger aria-label="Next month">
                          <ChevronRightIcon />
                        </DatePicker.NextTrigger>
                      </DatePicker.ViewControl>
                      <DatePicker.Table>
                        <DatePicker.TableHead>
                          <DatePicker.TableRow>
                            {api.weekDays.map((day, i) => (
                              <DatePicker.TableHeader key={i}>{day.short.slice(0, 2)}</DatePicker.TableHeader>
                            ))}
                          </DatePicker.TableRow>
                        </DatePicker.TableHead>
                        <DatePicker.TableBody>
                          {api.weeks.map((week, i) => (
                            <DatePicker.TableRow key={i}>
                              {week.map((day) => (
                                <DatePicker.TableCell key={day.toString()} value={day}>
                                  <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                        </DatePicker.TableBody>
                      </DatePicker.Table>
                    </>
                  )}
                </DatePicker.Context>
              </DatePicker.View>
              {(["month", "year"] as const).map((view) => (
                <DatePicker.View key={view} view={view}>
                  <DatePicker.Context>
                    {(api) => (
                      <>
                        <DatePicker.ViewControl>
                          <DatePicker.PrevTrigger aria-label="Previous period">
                            <ChevronLeftIcon />
                          </DatePicker.PrevTrigger>
                          <DatePicker.ViewTrigger>
                            <DatePicker.RangeText />
                          </DatePicker.ViewTrigger>
                          <DatePicker.NextTrigger aria-label="Next period">
                            <ChevronRightIcon />
                          </DatePicker.NextTrigger>
                        </DatePicker.ViewControl>
                        <DatePicker.Table columns={3}>
                          <DatePicker.TableBody>
                            {(view === "month"
                              ? api.getMonthsGrid({ columns: 3, format: "short" })
                              : api.getYearsGrid({ columns: 3 })
                            ).map((row, i) => (
                              <DatePicker.TableRow key={i}>
                                {row.map((cell) => (
                                  <DatePicker.TableCell key={cell.value} value={cell.value}>
                                    <DatePicker.TableCellTrigger>{cell.label}</DatePicker.TableCellTrigger>
                                  </DatePicker.TableCell>
                                ))}
                              </DatePicker.TableRow>
                            ))}
                          </DatePicker.TableBody>
                        </DatePicker.Table>
                      </>
                    )}
                  </DatePicker.Context>
                </DatePicker.View>
              ))}
            </DatePicker.Content>
          </DatePicker.Positioner>
        </Portal.Root>
      </DatePicker.Root>
    </section>
  )
}
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="date-picker-content"]', 300)
  return (
    <div className="space-y-5">
      {["default", "empty", "disabled", "invalid"].map((state) => (
        <Case key={state} state={state} />
      ))}
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
