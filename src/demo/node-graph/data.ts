import type { NodeGraphConnection, NodeGraphPortRef } from "@/components/ui/node-graph"

/** Pin data types. `exec` is control flow; the rest carry values. */
export type PinType = "exec" | "number" | "string" | "boolean"
export type Category = "Events" | "Flow control" | "Math" | "String" | "Variables"

export type PinDef = { id: string; label: string; type: PinType; default?: number | string | boolean }
export type NodeDef = {
  type: string
  title: string
  subtitle?: string
  category: Category
  inputs: PinDef[]
  outputs: PinDef[]
  keywords?: string
}

export type GraphNode = {
  id: string
  type: string
  position: { x: number; y: number }
  /** Literal values for unconnected inputs, keyed by pin id. */
  values: Record<string, number | string | boolean>
}
export type GraphEdge = { id: string; source: NodeGraphPortRef; target: NodeGraphPortRef }
export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] }

const exec = (id: string, label = ""): PinDef => ({ id, label, type: "exec" })
const num = (id: string, label: string, def = 0): PinDef => ({ id, label, type: "number", default: def })
const str = (id: string, label: string, def = ""): PinDef => ({ id, label, type: "string", default: def })
const bool = (id: string, label: string, def = false): PinDef => ({ id, label, type: "boolean", default: def })

export const nodeDefs: NodeDef[] = [
  { type: "event.begin-play", title: "Event BeginPlay", category: "Events", inputs: [], outputs: [exec("then")] },
  {
    type: "event.tick",
    title: "Event Tick",
    category: "Events",
    inputs: [],
    outputs: [exec("then"), num("delta", "Delta seconds")],
  },
  {
    type: "event.overlap",
    title: "On Actor Overlap",
    category: "Events",
    inputs: [],
    outputs: [exec("then"), str("actor", "Other actor")],
  },
  {
    type: "flow.branch",
    title: "Branch",
    subtitle: "if / else",
    category: "Flow control",
    inputs: [exec("in"), bool("condition", "Condition")],
    outputs: [exec("true", "True"), exec("false", "False")],
  },
  {
    type: "flow.sequence",
    title: "Sequence",
    category: "Flow control",
    inputs: [exec("in")],
    outputs: [exec("then0", "Then 0"), exec("then1", "Then 1")],
  },
  {
    type: "flow.delay",
    title: "Delay",
    category: "Flow control",
    inputs: [exec("in"), num("duration", "Duration", 0.5)],
    outputs: [exec("completed", "Completed")],
  },
  {
    type: "flow.loop",
    title: "For Loop",
    category: "Flow control",
    inputs: [exec("in"), num("first", "First index", 0), num("last", "Last index", 9)],
    outputs: [exec("body", "Loop body"), num("index", "Index"), exec("completed", "Completed")],
  },
  {
    type: "math.add",
    title: "Add",
    subtitle: "A + B",
    category: "Math",
    inputs: [num("a", "A"), num("b", "B")],
    outputs: [num("result", "Result")],
  },
  {
    type: "math.multiply",
    title: "Multiply",
    subtitle: "A × B",
    category: "Math",
    inputs: [num("a", "A"), num("b", "B", 1)],
    outputs: [num("result", "Result")],
  },
  {
    type: "math.greater",
    title: "Greater Than",
    subtitle: "A > B",
    category: "Math",
    inputs: [num("a", "A"), num("b", "B")],
    outputs: [bool("result", "Result")],
  },
  {
    type: "math.random",
    title: "Random Float in Range",
    category: "Math",
    keywords: "rand",
    inputs: [num("min", "Min", 0), num("max", "Max", 1)],
    outputs: [num("value", "Value")],
  },
  {
    type: "math.clamp",
    title: "Clamp",
    category: "Math",
    inputs: [num("value", "Value"), num("min", "Min", 0), num("max", "Max", 1)],
    outputs: [num("result", "Result")],
  },
  {
    type: "string.print",
    title: "Print String",
    category: "String",
    keywords: "log debug",
    inputs: [exec("in"), str("text", "In string", "Hello")],
    outputs: [exec("then")],
  },
  {
    type: "string.append",
    title: "Append",
    category: "String",
    inputs: [str("a", "A"), str("b", "B")],
    outputs: [str("result", "Result")],
  },
  {
    type: "string.to-string",
    title: "To String",
    subtitle: "number → string",
    category: "String",
    inputs: [num("value", "Value")],
    outputs: [str("result", "Result")],
  },
  {
    type: "string.contains",
    title: "Contains",
    category: "String",
    inputs: [str("text", "Text"), str("search", "Search")],
    outputs: [bool("result", "Result")],
  },
  {
    type: "var.get-score",
    title: "Get Score",
    subtitle: "number",
    category: "Variables",
    inputs: [],
    outputs: [num("value", "Score")],
  },
  {
    type: "var.set-score",
    title: "Set Score",
    subtitle: "number",
    category: "Variables",
    inputs: [exec("in"), num("value", "Score")],
    outputs: [exec("then"), num("out", "Score")],
  },
  {
    type: "var.get-name",
    title: "Get Player Name",
    subtitle: "string",
    category: "Variables",
    inputs: [],
    outputs: [str("value", "Player name")],
  },
  {
    type: "var.get-alive",
    title: "Is Alive",
    subtitle: "boolean",
    category: "Variables",
    inputs: [],
    outputs: [bool("value", "Alive")],
  },
]

export const categories: Category[] = ["Events", "Flow control", "Math", "String", "Variables"]

export const defByType = new Map(nodeDefs.map((d) => [d.type, d]))

export function getDef(type: string) {
  const def = defByType.get(type)
  if (!def) throw new Error(`Unknown node type ${type}`)
  return def
}

export function defaultValues(def: NodeDef) {
  const values: GraphNode["values"] = {}
  for (const pin of def.inputs) if (pin.default !== undefined) values[pin.id] = pin.default
  return values
}

let counter = 0
export function createNode(type: string, position: { x: number; y: number }): GraphNode {
  const def = getDef(type)
  return {
    id: `${type.split(".")[1]}-${Date.now().toString(36)}${(counter++).toString(36)}`,
    type,
    position,
    values: defaultValues(def),
  }
}

export const edgeId = (c: NodeGraphConnection) =>
  `${c.source.nodeId}:${c.source.portId}->${c.target.nodeId}:${c.target.portId}`

const samePort = (a: NodeGraphPortRef, b: NodeGraphPortRef) => a.nodeId === b.nodeId && a.portId === b.portId

/**
 * Add a connection with scripting-graph rules: data inputs and exec outputs
 * accept one edge (a new one replaces it); data outputs and exec inputs fan out.
 */
export function connect(graph: Graph, c: NodeGraphConnection): Graph {
  const sourceNode = graph.nodes.find((n) => n.id === c.source.nodeId)
  const targetNode = graph.nodes.find((n) => n.id === c.target.nodeId)
  if (!sourceNode || !targetNode) return graph
  const pin = getDef(sourceNode.type).outputs.find((p) => p.id === c.source.portId)
  if (!pin) return graph
  const id = edgeId(c)
  if (graph.edges.some((e) => e.id === id)) return graph
  const edges = graph.edges.filter((e) => {
    if (pin.type === "exec") return !samePort(e.source, c.source)
    return !samePort(e.target, c.target)
  })
  return { ...graph, edges: [...edges, { id, source: c.source, target: c.target }] }
}

export function removeItems(graph: Graph, ids: { nodes: string[]; edges: string[] }): Graph {
  const nodeIds = new Set(ids.nodes)
  const edgeIds = new Set(ids.edges)
  return {
    nodes: graph.nodes.filter((n) => !nodeIds.has(n.id)),
    edges: graph.edges.filter(
      (e) => !edgeIds.has(e.id) && !nodeIds.has(e.source.nodeId) && !nodeIds.has(e.target.nodeId)
    ),
  }
}

export function moveNodes(graph: Graph, moves: { id: string; position: { x: number; y: number } }[]): Graph {
  const byId = new Map(moves.map((m) => [m.id, m.position]))
  return { ...graph, nodes: graph.nodes.map((n) => (byId.has(n.id) ? { ...n, position: byId.get(n.id)! } : n)) }
}

export function setValue(graph: Graph, nodeId: string, pinId: string, value: number | string | boolean): Graph {
  return {
    ...graph,
    nodes: graph.nodes.map((n) => (n.id === nodeId ? { ...n, values: { ...n.values, [pinId]: value } } : n)),
  }
}

/** Nodes that expose a pin compatible with `type` on the opposite side. */
export function compatibleDefs(side: "input" | "output", type: PinType) {
  return nodeDefs.filter((d) => (side === "output" ? d.inputs : d.outputs).some((p) => p.type === type))
}

export function firstPin(def: NodeDef, side: "input" | "output", type: PinType) {
  return (side === "input" ? def.inputs : def.outputs).find((p) => p.type === type)
}

const n = (id: string, type: string, x: number, y: number, values: GraphNode["values"] = {}): GraphNode => ({
  id,
  type,
  position: { x, y },
  values: { ...defaultValues(getDef(type)), ...values },
})

const e = (s: string, sp: string, t: string, tp: string): GraphEdge => {
  const c = { source: { nodeId: s, portId: sp }, target: { nodeId: t, portId: tp } }
  return { id: edgeId(c), ...c }
}

export function buildGraph(): Graph {
  return {
    nodes: [
      n("begin", "event.begin-play", 0, 120),
      n("score", "var.get-score", 0, 320),
      n("greater", "math.greater", 340, 300, { b: 100 }),
      n("branch", "flow.branch", 340, 100),
      n("name", "var.get-name", 340, 480),
      n("append", "string.append", 680, 440, { b: " reached a high score!" }),
      n("print-high", "string.print", 700, 40),
      n("print-low", "string.print", 700, 220, { text: "Keep going" }),
      n("delay", "flow.delay", 1040, 40, { duration: 2 }),
      n("set", "var.set-score", 1380, 40, { value: 0 }),
    ],
    edges: [
      e("begin", "then", "branch", "in"),
      e("score", "value", "greater", "a"),
      e("greater", "result", "branch", "condition"),
      e("branch", "true", "print-high", "in"),
      e("branch", "false", "print-low", "in"),
      e("name", "value", "append", "a"),
      e("append", "result", "print-high", "text"),
      e("print-high", "then", "delay", "in"),
      e("delay", "completed", "set", "in"),
    ],
  }
}

/** Remove every edge touching one port. */
export function disconnectPort(graph: Graph, ref: NodeGraphPortRef): Graph {
  return { ...graph, edges: graph.edges.filter((e) => !samePort(e.source, ref) && !samePort(e.target, ref)) }
}

/** Remove every edge touching one node. */
export function disconnectNode(graph: Graph, nodeId: string): Graph {
  return { ...graph, edges: graph.edges.filter((e) => e.source.nodeId !== nodeId && e.target.nodeId !== nodeId) }
}

/** Copy nodes (and the edges between them) with a small offset; returns the new ids. */
export function duplicateNodes(graph: Graph, ids: string[]): { graph: Graph; ids: string[] } {
  const idMap = new Map<string, string>()
  const copies: GraphNode[] = []
  for (const node of graph.nodes) {
    if (!ids.includes(node.id)) continue
    const copy = createNode(node.type, { x: node.position.x + 40, y: node.position.y + 40 })
    copy.values = { ...node.values }
    idMap.set(node.id, copy.id)
    copies.push(copy)
  }
  const edges = graph.edges
    .filter((e) => idMap.has(e.source.nodeId) && idMap.has(e.target.nodeId))
    .map((e) => {
      const c = {
        source: { nodeId: idMap.get(e.source.nodeId)!, portId: e.source.portId },
        target: { nodeId: idMap.get(e.target.nodeId)!, portId: e.target.portId },
      }
      return { id: edgeId(c), ...c }
    })
  return { graph: { nodes: [...graph.nodes, ...copies], edges: [...graph.edges, ...edges] }, ids: [...idMap.values()] }
}
