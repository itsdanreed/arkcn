import type { CanvasDropDetails } from "@/components/ui/canvas"

/**
 * Rows-and-columns layout helpers for the Canvas primitive. A layout is
 * `Row[]`, each row a list of items with a `width` (flex-grow weight). Drops
 * above/below an item create a row, beside it a column; the resize handle
 * shifts width between neighbours. Shared by the form builder and the widgets
 * page.
 */

export type RowItem = { id: string; width: number }
export type Row<T extends RowItem> = { id: string; items: T[] }

const MIN_SHARE = 0.12

export function applyRowDrop<T extends RowItem>(
  rows: Row<T>[],
  details: CanvasDropDetails,
  options: { create: (data: unknown) => T | null; rowId: () => string }
): Row<T>[] {
  let item: T | undefined
  let next = rows
  let sourceRowIndex = -1
  if (details.source.type === "node") {
    const id = details.source.id
    item = rows.flatMap((r) => r.items).find((i) => i.id === id)
    sourceRowIndex = rows.findIndex((r) => r.items.some((i) => i.id === id))
    next = rows.map((r) => ({ ...r, items: r.items.filter((i) => i.id !== id) })).filter((r) => r.items.length > 0)
  } else {
    item = options.create(details.source.data) ?? undefined
  }
  if (!item) return rows

  const target = details.target
  if (target.type === "area") return [...next, { id: options.rowId(), items: [{ ...item, width: 1 }] }]

  // Dropping a node on its own top/bottom edge (keyboard: "move up/down" while it has siblings)
  // pulls it out into a new row above or below its current row.
  if (details.source.type === "node" && target.id === details.source.id) {
    if (target.edge !== "top" && target.edge !== "bottom") return rows
    const stillThere = next.length === rows.length
    if (!stillThere) return rows
    const at = target.edge === "top" ? sourceRowIndex : sourceRowIndex + 1
    const newRow = { id: options.rowId(), items: [{ ...item, width: 1 }] }
    return [...next.slice(0, at), newRow, ...next.slice(at)]
  }

  const rowIndex = next.findIndex((r) => r.items.some((i) => i.id === target.id))
  if (rowIndex < 0) return rows
  const row = next[rowIndex]
  const index = row.items.findIndex((i) => i.id === target.id)
  if (target.edge === "top" || target.edge === "bottom") {
    const at = target.edge === "top" ? rowIndex : rowIndex + 1
    const newRow = { id: options.rowId(), items: [{ ...item, width: 1 }] }
    return [...next.slice(0, at), newRow, ...next.slice(at)]
  }
  const mean = row.items.reduce((s, i) => s + i.width, 0) / row.items.length
  const at = target.edge === "left" ? index : index + 1
  const items = [...row.items.slice(0, at), { ...item, width: mean }, ...row.items.slice(at)]
  return next.map((r, i) => (i === rowIndex ? { ...r, items } : r))
}

/** Move width from item `index` to `index + 1` by a fraction of the row. */
export function resizeRowItems<T extends RowItem>(row: Row<T>, index: number, deltaFraction: number): Row<T> {
  const total = row.items.reduce((s, i) => s + i.width, 0)
  const delta = deltaFraction * total
  const a = row.items[index]
  const b = row.items[index + 1]
  if (!a || !b) return row
  const min = MIN_SHARE * total
  const clamped = Math.max(min - a.width, Math.min(delta, b.width - min))
  if (clamped === 0) return row
  const items = row.items.map((i, k) =>
    k === index ? { ...i, width: a.width + clamped } : k === index + 1 ? { ...i, width: b.width - clamped } : i
  )
  return { ...row, items }
}

export function removeRowItem<T extends RowItem>(rows: Row<T>[], id: string): Row<T>[] {
  return rows.map((r) => ({ ...r, items: r.items.filter((i) => i.id !== id) })).filter((r) => r.items.length > 0)
}
