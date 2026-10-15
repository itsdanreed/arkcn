/** Prefix offsets keep variable-height row virtualization and frozen panes consistent. */
export function rowMetrics(count: number, defaultHeight: number, minHeight: number, sizes: Record<number, number>) {
  const heights = Array.from({ length: count }, (_, row) =>
    Math.max(minHeight, Number.isFinite(sizes[row]) ? sizes[row] : defaultHeight)
  )
  const offsets = [0]
  for (const height of heights) offsets.push(offsets[offsets.length - 1] + height)
  return { heights, offsets }
}
/** Index containing an offset; returns count at/past the end. */
export function rowAtOffset(offsets: readonly number[], offset: number) {
  let low = 0,
    high = offsets.length - 1
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    if (offsets[mid] <= offset) low = mid
    else high = mid - 1
  }
  return low
}
