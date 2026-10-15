import { useState } from "react"
import { Text, View } from "react-native"
import { Spreadsheet, type SpreadsheetValue, type SpreadsheetChange } from "./components/ui/spreadsheet"
import { Button } from "./components/ui/button"
import { useNativeTheme } from "./lib/theme"
const seed: SpreadsheetValue[][] = [
  ["Item", "Qty", "Price", "Total"],
  ["Desk", 2, 320, "=B2*C2"],
  ["Chair", 4, 150, "=B3*C3"],
  ["Lamp", 6, 45, "=B4*C4"],
  ["Sum", null, null, "=SUM(D2:D4)"],
  ["Error", "=1/0", null, null],
]
export function SpreadsheetValidation() {
  const [data, setData] = useState(seed)
  const [readOnly, setReadOnly] = useState(false)
  const [empty, setEmpty] = useState(false)
  const { colors, typography } = useNativeTheme()
  const change = (changes: SpreadsheetChange[]) =>
    setData((prev) => {
      const next = prev.map((r) => [...r])
      for (const c of changes) {
        next[c.row] ??= []
        next[c.row][c.column] = c.value
      }
      return next
    })
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...typography.medium, fontSize: 14, lineHeight: 20, color: colors.foreground }}>
        Editing · selection · clipboard · fill · history
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button variant="outline" onPress={() => setReadOnly(!readOnly)}>
          {readOnly ? "Enable editing" : "Read only"}
        </Button>
        <Button variant="outline" onPress={() => setEmpty(!empty)}>
          {empty ? "Restore cells" : "Empty sheet"}
        </Button>
        <Button variant="outline" onPress={() => setData(seed)}>
          Reset data
        </Button>
      </View>
      <Spreadsheet.Root
        data={empty ? [] : data}
        rowCount={empty ? 0 : 10000}
        columnCount={8}
        frozenRows={1}
        frozenColumns={1}
        defaultColumnWidths={{ 0: 120 }}
        defaultSelection={{ anchor: { row: 1, column: 3 }, focus: { row: 1, column: 3 } }}
        readOnly={readOnly}
        onCellsChange={change}
        style={{ height: 460 }}
      >
        <Spreadsheet.FormulaBar>
          <Spreadsheet.NameBox />
          <Spreadsheet.FormulaInput />
          <Spreadsheet.UndoTrigger />
          <Spreadsheet.RedoTrigger />
        </Spreadsheet.FormulaBar>
        <Spreadsheet.Toolbar />
        <Spreadsheet.Context>
          {(sheet) => (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button variant="outline" size="sm" onPress={() => sheet.focusCell({ row: 9999, column: 7 })}>
                Last cell
              </Button>
              <Button variant="outline" size="sm" onPress={() => sheet.focusCell({ row: 1, column: 3 })}>
                D2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() => sheet.select({ anchor: { row: 1, column: 1 }, focus: { row: 2, column: 1 } })}
              >
                Select B2:B3
              </Button>
            </View>
          )}
        </Spreadsheet.Context>
        <Spreadsheet.Container />
      </Spreadsheet.Root>
    </View>
  )
}
