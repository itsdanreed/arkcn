import { getDef, type Graph, type GraphNode, type PinType } from "./data"

/**
 * A tiny interpreter for the demo graph. Execution follows exec pins from an
 * event node; data pins are pulled lazily: pure nodes (no exec pins) are
 * evaluated on demand, impure nodes expose the outputs they produced when
 * they last ran. The runner is an async generator so the UI can animate each
 * step and cancel at any time.
 */

export type SimValue = number | string | boolean
export type SimVariables = { score: number; playerName: string; alive: boolean }

export type SimStep =
  | { kind: "enter"; nodeId: string }
  | { kind: "edge"; edgeId: string }
  | { kind: "log"; nodeId: string; text: string }
  | { kind: "wait"; nodeId: string; ms: number }
  | { kind: "error"; nodeId: string; message: string }
  | { kind: "done"; steps: number }

export type SimSnapshot = {
  vars: SimVariables
  /** Every output value produced so far, keyed by `nodeId:pinId`. */
  values: Map<string, SimValue>
}

export const defaultVariables = (): SimVariables => ({ score: 42, playerName: "Alex", alive: true })

const MAX_STEPS = 400

const zero: Record<PinType, SimValue> = { exec: false, number: 0, string: "", boolean: false }

export function formatValue(value: SimValue) {
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2)
  if (typeof value === "boolean") return value ? "true" : "false"
  return JSON.stringify(value)
}

export function isEventNode(node: GraphNode) {
  return node.type.startsWith("event.")
}

export async function* execute(
  graph: Graph,
  startNodeId: string,
  snapshot: SimSnapshot,
  random: () => number = Math.random
): AsyncGenerator<SimStep, void, void> {
  const nodes = new Map(graph.nodes.map((n) => [n.id, n]))
  const { vars, values } = snapshot
  let steps = 0

  const edgeInto = (nodeId: string, pinId: string) =>
    graph.edges.find((e) => e.target.nodeId === nodeId && e.target.portId === pinId)
  const edgeOutOf = (nodeId: string, pinId: string) =>
    graph.edges.find((e) => e.source.nodeId === nodeId && e.source.portId === pinId)

  const setOut = (node: GraphNode, pinId: string, value: SimValue) => values.set(`${node.id}:${pinId}`, value)

  /** Read an input: connected source output, else the literal, else the type's zero value. */
  const read = (node: GraphNode, pinId: string): SimValue => {
    const pin = getDef(node.type).inputs.find((p) => p.id === pinId)
    const edge = edgeInto(node.id, pinId)
    if (!edge) return node.values[pinId] ?? pin?.default ?? zero[pin?.type ?? "number"]
    const source = nodes.get(edge.source.nodeId)
    if (!source) return zero[pin?.type ?? "number"]
    if (isPure(source)) evaluatePure(source)
    return values.get(`${source.id}:${edge.source.portId}`) ?? zero[pin?.type ?? "number"]
  }

  const isPure = (node: GraphNode) => {
    const def = getDef(node.type)
    return !def.inputs.some((p) => p.type === "exec") && !def.outputs.some((p) => p.type === "exec")
  }

  const evaluatePure = (node: GraphNode) => {
    const num = (pin: string) => Number(read(node, pin))
    const str = (pin: string) => String(read(node, pin))
    switch (node.type) {
      case "math.add":
        return setOut(node, "result", num("a") + num("b"))
      case "math.multiply":
        return setOut(node, "result", num("a") * num("b"))
      case "math.greater":
        return setOut(node, "result", num("a") > num("b"))
      case "math.random":
        return setOut(node, "value", num("min") + random() * (num("max") - num("min")))
      case "math.clamp":
        return setOut(node, "result", Math.min(num("max"), Math.max(num("min"), num("value"))))
      case "string.append":
        return setOut(node, "result", str("a") + str("b"))
      case "string.to-string":
        return setOut(node, "result", formatValue(read(node, "value")))
      case "string.contains":
        return setOut(node, "result", str("text").toLowerCase().includes(str("search").toLowerCase()))
      case "var.get-score":
        return setOut(node, "value", vars.score)
      case "var.get-name":
        return setOut(node, "value", vars.playerName)
      case "var.get-alive":
        return setOut(node, "value", vars.alive)
    }
  }

  /** Follow an exec output to the next node, if anything is wired to it. */
  async function* follow(node: GraphNode, pinId: string): AsyncGenerator<SimStep, void, void> {
    const edge = edgeOutOf(node.id, pinId)
    if (!edge) return
    const next = nodes.get(edge.target.nodeId)
    if (!next) return
    yield { kind: "edge", edgeId: edge.id }
    yield* run(next)
  }

  async function* run(node: GraphNode): AsyncGenerator<SimStep, void, void> {
    if (++steps > MAX_STEPS) {
      yield { kind: "error", nodeId: node.id, message: `Stopped after ${MAX_STEPS} steps (infinite loop?)` }
      return
    }
    yield { kind: "enter", nodeId: node.id }
    switch (node.type) {
      case "event.begin-play":
        return yield* follow(node, "then")
      case "event.tick":
        setOut(node, "delta", 0.016)
        return yield* follow(node, "then")
      case "event.overlap":
        setOut(node, "actor", "Enemy_01")
        return yield* follow(node, "then")
      case "flow.branch": {
        const condition = Boolean(read(node, "condition"))
        return yield* follow(node, condition ? "true" : "false")
      }
      case "flow.sequence":
        yield* follow(node, "then0")
        yield { kind: "enter", nodeId: node.id }
        return yield* follow(node, "then1")
      case "flow.delay": {
        const duration = Math.max(0, Number(read(node, "duration")))
        yield { kind: "wait", nodeId: node.id, ms: duration * 1000 }
        return yield* follow(node, "completed")
      }
      case "flow.loop": {
        const first = Math.round(Number(read(node, "first")))
        const last = Math.round(Number(read(node, "last")))
        for (let index = first; index <= last; index++) {
          setOut(node, "index", index)
          yield* follow(node, "body")
          if (steps > MAX_STEPS) return
          yield { kind: "enter", nodeId: node.id }
        }
        return yield* follow(node, "completed")
      }
      case "string.print": {
        const text = String(read(node, "text"))
        yield { kind: "log", nodeId: node.id, text }
        return yield* follow(node, "then")
      }
      case "var.set-score": {
        const value = Number(read(node, "value"))
        vars.score = value
        setOut(node, "out", value)
        return yield* follow(node, "then")
      }
      default:
        if (isPure(node)) evaluatePure(node)
        return
    }
  }

  const start = nodes.get(startNodeId)
  if (!start) {
    yield { kind: "error", nodeId: startNodeId, message: "Event node not found" }
    return
  }
  yield* run(start)
  yield { kind: "done", steps }
}
