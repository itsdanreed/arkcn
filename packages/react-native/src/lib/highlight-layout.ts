/** Intersect matching character ranges with native text's already-wrapped lines. */
export type HighlightLine = {
  text: string
  x: number
  y: number
  width: number
  height: number
  ascender: number
  descender: number
}
export function getHighlightSegments(chunks: { text: string; match: boolean }[], lines: HighlightLine[]) {
  let offset = 0
  const ranges = chunks.flatMap((chunk) => {
    const start = offset
    offset += chunk.text.length
    return chunk.match && offset > start ? [{ start, end: offset }] : []
  })
  let lineStart = 0
  return lines.flatMap((line, lineIndex) => {
    const start = lineStart
    lineStart += line.text.length
    return ranges.flatMap((range) => {
      const from = Math.max(start, range.start) - start
      const to = Math.min(lineStart, range.end) - start
      if (to <= from) return []
      return [
        {
          key: `${lineIndex}:${from}:${to}`,
          line,
          before: line.text.slice(0, from),
          through: line.text.slice(0, to).replace(/[\r\n]+$/, ""),
        },
      ]
    })
  })
}
