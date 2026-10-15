import * as React from "react"
import {
  Spreadsheet,
  type SpreadsheetChange,
  type SpreadsheetValue,
} from "@multicomma/arkcn-react-native/ui/spreadsheet"

const ROWS = 10_000
// More columns than fit, so the sheet scrolls sideways while column A stays frozen.
const COLUMNS = 26

// A budget sheet: a header row, a few hand-written lines with formulas, then generated rows.
function seed(): SpreadsheetValue[][] {
  const rows: SpreadsheetValue[][] = [
    ["Item", "Qty", "Unit price", "Total", "", "Summary", "", ""],
    ["Desk", 2, 320, "=B2*C2", "", "Items", "=COUNT(B2:B10000)", ""],
    ["Chair", 4, 150, "=B3*C3", "", "Sum", "=SUM(D2:D10000)", ""],
    ["Monitor", 3, 240, "=B4*C4", "", "Average", "=AVERAGE(D2:D10000)", ""],
    ["Lamp", 6, 45, "=B5*C5", "", "Max", "=MAX(D2:D10000)", ""],
  ]
  const names = ["Cable", "Adapter", "Notebook", "Pen", "Mouse", "Keyboard", "Stand", "Headset"]
  for (let r = rows.length; r < ROWS; r++) {
    const qty = (r % 7) + 1
    const price = 5 + ((r * 37) % 200)
    rows.push([names[r % names.length], qty, price, `=B${r + 1}*C${r + 1}`, null, null, null, null])
  }
  return rows
}

export default function SpreadsheetExample() {
  const [data, setData] = React.useState<SpreadsheetValue[][]>(seed)
  // Every edit, paste, fill, undo, and redo arrives as a batch of intents; the consumer applies it.
  const onCellsChange = (changes: SpreadsheetChange[]) =>
    setData((prev) => {
      const next = prev.slice()
      for (const { row, column, value } of changes) {
        const line = next[row] === prev[row] ? prev[row].slice() : next[row]
        line[column] = value
        next[row] = line
      }
      return next
    })
  return (
    <Spreadsheet.Root
      data={data}
      columnCount={COLUMNS}
      onCellsChange={onCellsChange}
      frozenRows={1}
      frozenColumns={1}
      defaultColumnWidths={{ 0: 120, 5: 110, 6: 120 }}
      defaultSelection={{ anchor: { row: 1, column: 3 }, focus: { row: 1, column: 3 } }}
      style={{ height: 384, width: "100%" }}
    >
      <Spreadsheet.FormulaBar>
        <Spreadsheet.NameBox />
        <Spreadsheet.FormulaInput />
        <Spreadsheet.UndoTrigger />
        <Spreadsheet.RedoTrigger />
      </Spreadsheet.FormulaBar>
      <Spreadsheet.Container accessibilityLabel="Budget">
        <Spreadsheet.Header>
          <Spreadsheet.HeaderRow />
        </Spreadsheet.Header>
        <Spreadsheet.Body />
        <Spreadsheet.Empty>No cells</Spreadsheet.Empty>
      </Spreadsheet.Container>
    </Spreadsheet.Root>
  )
}
