import { isFormula, shiftFormula, type FormulaCellAddress } from "./formula"
export type SpreadsheetValue = string | number | boolean | null
export type SpreadsheetCellAddress = FormulaCellAddress
export type SpreadsheetSelection = { anchor: SpreadsheetCellAddress; focus: SpreadsheetCellAddress }
export type SpreadsheetBounds = { r0: number; r1: number; c0: number; c1: number }
export type SpreadsheetChange = SpreadsheetCellAddress & { value: SpreadsheetValue; previous: SpreadsheetValue }
export type SpreadsheetData = readonly (readonly (SpreadsheetValue | undefined)[])[]
export const sameCell = (a?: SpreadsheetCellAddress | null, b?: SpreadsheetCellAddress | null) =>
  !!a && !!b && a.row === b.row && a.column === b.column
export const boundsOf = (s: SpreadsheetSelection | null): SpreadsheetBounds | null =>
  s
    ? {
        r0: Math.min(s.anchor.row, s.focus.row),
        r1: Math.max(s.anchor.row, s.focus.row),
        c0: Math.min(s.anchor.column, s.focus.column),
        c1: Math.max(s.anchor.column, s.focus.column),
      }
    : null
export const rawText = (value: SpreadsheetValue) =>
  value === null ? "" : typeof value === "boolean" ? (value ? "TRUE" : "FALSE") : String(value)
export function parseInput(text: string): SpreadsheetValue {
  if (text === "") return null
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(text.trim()) && Number.isFinite(Number(text))) return Number(text)
  return text
}
export function fillTarget(source: SpreadsheetBounds, cell: SpreadsheetCellAddress): SpreadsheetBounds {
  const distances = [cell.row - source.r1, source.r0 - cell.row, cell.column - source.c1, source.c0 - cell.column]
  const best = Math.max(...distances)
  if (best <= 0) return source
  const index = distances.indexOf(best)
  return {
    ...source,
    [index === 0 ? "r1" : index === 1 ? "r0" : index === 2 ? "c1" : "c0"]: index < 2 ? cell.row : cell.column,
  }
}
export function fillChanges(
  source: SpreadsheetBounds,
  target: SpreadsheetBounds,
  getRaw: (cell: SpreadsheetCellAddress) => SpreadsheetValue
): SpreadsheetChange[] {
  const changes: SpreadsheetChange[] = []
  const vertical = target.r0 !== source.r0 || target.r1 !== source.r1
  for (let row = target.r0; row <= target.r1; row++)
    for (let column = target.c0; column <= target.c1; column++) {
      if (row >= source.r0 && row <= source.r1 && column >= source.c0 && column <= source.c1) continue
      const start = vertical ? source.r0 : source.c0
      const end = vertical ? source.r1 : source.c1
      const pos = vertical ? row : column
      const line = Array.from({ length: end - start + 1 }, (_, i) =>
        getRaw(vertical ? { row: start + i, column } : { row, column: start + i })
      )
      const numbers = line.every((v) => typeof v === "number") ? (line as number[]) : null
      const step = numbers && numbers.length > 1 ? numbers[1] - numbers[0] : null
      const series = step !== null && numbers?.every((n, i) => i === 0 || Math.abs(n - numbers[i - 1] - step) < 1e-9)
      const index = (((pos - start) % line.length) + line.length) % line.length
      let value: SpreadsheetValue = series ? numbers![0] + step! * (pos - start) : line[index]
      if (isFormula(value))
        value = shiftFormula(value, vertical ? row - (start + index) : 0, vertical ? 0 : column - (start + index))
      changes.push({ row, column, value, previous: getRaw({ row, column }) })
    }
  return changes
}
