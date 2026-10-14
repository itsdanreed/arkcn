/** Platform-independent drop intent; each renderer supplies its own gesture handling. */
export type CanvasSource = { type: "palette"; data: unknown } | { type: "node"; id: string }
export type CanvasTarget = { type: "node"; id: string; edge: "top" | "bottom" | "left" | "right" } | { type: "area" }
export type CanvasDropDetails = { source: CanvasSource; target: CanvasTarget }
