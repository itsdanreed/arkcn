import { DatePicker } from "@/components/ui/date-picker"
import { Portal } from "@/components/ui/portal"
export default function DatePickerExample() {
  return (
    <DatePicker.Root className="w-72">
      <DatePicker.Label>Appointment date</DatePicker.Label>
      <DatePicker.Control>
        <DatePicker.Input />
        <DatePicker.Trigger>Choose date</DatePicker.Trigger>
        <DatePicker.ClearTrigger aria-label="Clear date">×</DatePicker.ClearTrigger>
      </DatePicker.Control>
      <Portal.Root>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous month">‹</DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next month">›</DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableHead>
                        <DatePicker.TableRow>
                          {api.weekDays.map((day, index) => (
                            <DatePicker.TableHeader key={index}>{day.short}</DatePicker.TableHeader>
                          ))}
                        </DatePicker.TableRow>
                      </DatePicker.TableHead>
                      <DatePicker.TableBody>
                        {api.weeks.map((week, index) => (
                          <DatePicker.TableRow key={index}>
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
            <DatePicker.View view="month">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous year">‹</DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next year">›</DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {api.getMonthsGrid({ columns: 3, format: "short" }).map((months, index) => (
                          <DatePicker.TableRow key={index}>
                            {months.map((month) => (
                              <DatePicker.TableCell key={month.value} value={month.value}>
                                <DatePicker.TableCellTrigger>{month.label}</DatePicker.TableCellTrigger>
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
            <DatePicker.View view="year">
              <DatePicker.Context>
                {(api) => (
                  <>
                    <DatePicker.ViewControl>
                      <DatePicker.PrevTrigger aria-label="Previous decade">‹</DatePicker.PrevTrigger>
                      <DatePicker.ViewTrigger>
                        <DatePicker.RangeText />
                      </DatePicker.ViewTrigger>
                      <DatePicker.NextTrigger aria-label="Next decade">›</DatePicker.NextTrigger>
                    </DatePicker.ViewControl>
                    <DatePicker.Table>
                      <DatePicker.TableBody>
                        {api.getYearsGrid({ columns: 3 }).map((years, index) => (
                          <DatePicker.TableRow key={index}>
                            {years.map((year) => (
                              <DatePicker.TableCell key={year.value} value={year.value}>
                                <DatePicker.TableCellTrigger>{year.label}</DatePicker.TableCellTrigger>
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
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal.Root>
    </DatePicker.Root>
  )
}
