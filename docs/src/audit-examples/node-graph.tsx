import * as React from "react"
import { NodeGraph } from "@/components/ui/node-graph"

import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"

type Port = { id: string; label: string; type: "number" | "string" | "exec" }
type Node = { id: string; title: string; position: { x: number; y: number }; inputs: Port[]; outputs: Port[] }
type Edge = { id: string; source: { nodeId: string; portId: string }; target: { nodeId: string; portId: string } }

const pinColor = { number: "text-emerald-500", string: "text-fuchsia-500", exec: "text-foreground" }

export default function NodeGraphExample() {
  const [empty, setEmpty] = React.useState(false)
  const { trace } = useAuditMotion('[data-slot="node-graph-node"], [data-slot="node-graph-port-pin"]')
  const nextEdgeId = React.useRef(4)
  const [nodes, setNodes] = React.useState<Node[]>([
    {
      id: "a",
      title: "Price",
      position: { x: 40, y: 60 },
      inputs: [],
      outputs: [
        { id: "run", label: "Run", type: "exec" },
        { id: "out", label: "value", type: "number" },
      ],
    },
    {
      id: "b",
      title: "Tax rate",
      position: { x: 40, y: 200 },
      inputs: [],
      outputs: [{ id: "out", label: "value", type: "number" }],
    },
    {
      id: "c",
      title: "Multiply",
      position: { x: 320, y: 120 },
      inputs: [
        { id: "run", label: "Run", type: "exec" },
        { id: "x", label: "a", type: "number" },
        { id: "y", label: "b", type: "number" },
      ],
      outputs: [
        { id: "then", label: "Then", type: "exec" },
        { id: "out", label: "result", type: "number" },
      ],
    },
  ])
  const [edges, setEdges] = React.useState<Edge[]>([
    { id: "e3", source: { nodeId: "a", portId: "run" }, target: { nodeId: "c", portId: "run" } },
    { id: "e1", source: { nodeId: "a", portId: "out" }, target: { nodeId: "c", portId: "x" } },
    { id: "e2", source: { nodeId: "b", portId: "out" }, target: { nodeId: "c", portId: "y" } },
  ])
  const connected = (nodeId: string, portId: string) =>
    edges.some(
      (e) =>
        (e.source.nodeId === nodeId && e.source.portId === portId) ||
        (e.target.nodeId === nodeId && e.target.portId === portId)
    )
  return (
    <div className="space-y-4">
      <Button variant="outline" aria-pressed={empty} onClick={() => setEmpty(!empty)}>
        Empty graph
      </Button>
      <NodeGraph.Root
        onNodesMove={(moves) =>
          setNodes((prev) =>
            prev.map((n) => ({ ...n, position: moves.find((m) => m.id === n.id)?.position ?? n.position }))
          )
        }
        onConnect={({ source, target }) => {
          const id = `e${nextEdgeId.current++}`
          setEdges((prev) => [...prev, { id, source, target }])
        }}
        onDisconnect={({ nodeId, portId }) =>
          setEdges((prev) =>
            prev.filter(
              (edge) =>
                !(edge.source.nodeId === nodeId && edge.source.portId === portId) &&
                !(edge.target.nodeId === nodeId && edge.target.portId === portId)
            )
          )
        }
        onDelete={({ nodes: ids, edges: edgeIds }) => {
          setNodes((prev) => prev.filter((n) => !ids.includes(n.id)))
          setEdges((prev) =>
            prev.filter(
              (e) => !edgeIds.includes(e.id) && !ids.includes(e.source.nodeId) && !ids.includes(e.target.nodeId)
            )
          )
        }}
        className="h-96 w-full"
      >
        <NodeGraph.Viewport>
          <NodeGraph.Background />
          <NodeGraph.Surface>
            <NodeGraph.Edges>
              {!empty &&
                edges.map((edge) => (
                  <NodeGraph.Edge key={edge.id} value={edge.id} source={edge.source} target={edge.target} />
                ))}
            </NodeGraph.Edges>
            <NodeGraph.ConnectionLine />
            {!empty &&
              nodes.map((node) => (
                <NodeGraph.Node key={node.id} value={node.id} position={node.position} aria-label={node.title}>
                  <NodeGraph.NodeHeader>
                    <div>
                      <NodeGraph.NodeTitle>{node.title}</NodeGraph.NodeTitle>
                      <NodeGraph.NodeSubtitle>
                        {node.id === "c" ? "Multiply two values" : "Number input"}
                      </NodeGraph.NodeSubtitle>
                    </div>
                  </NodeGraph.NodeHeader>
                  <NodeGraph.NodeBody>
                    <NodeGraph.NodeInputs>
                      {node.inputs.map((pin) => (
                        <NodeGraph.Port
                          key={pin.id}
                          value={pin.id}
                          side="input"
                          type={pin.type}
                          connected={connected(node.id, pin.id)}
                        >
                          <NodeGraph.PortPin
                            variant={pin.type === "exec" ? "exec" : "circle"}
                            className={pinColor[pin.type]}
                          />
                          <NodeGraph.PortLabel>{pin.label}</NodeGraph.PortLabel>
                        </NodeGraph.Port>
                      ))}
                    </NodeGraph.NodeInputs>
                    <NodeGraph.NodeOutputs>
                      {node.outputs.map((pin) => (
                        <NodeGraph.Port
                          key={pin.id}
                          value={pin.id}
                          side="output"
                          type={pin.type}
                          connected={connected(node.id, pin.id)}
                        >
                          <NodeGraph.PortLabel>{pin.label}</NodeGraph.PortLabel>
                          <NodeGraph.PortPin
                            variant={pin.type === "exec" ? "exec" : "circle"}
                            className={pinColor[pin.type]}
                          />
                        </NodeGraph.Port>
                      ))}
                    </NodeGraph.NodeOutputs>
                  </NodeGraph.NodeBody>
                </NodeGraph.Node>
              ))}
          </NodeGraph.Surface>
          <NodeGraph.SelectionBox />
          <NodeGraph.Minimap />
          {empty && <NodeGraph.Empty>No nodes yet</NodeGraph.Empty>}
          <NodeGraph.Controls>
            <NodeGraph.ZoomOutTrigger />
            <NodeGraph.ZoomValue />
            <NodeGraph.ZoomInTrigger />
            <NodeGraph.FitViewTrigger />
          </NodeGraph.Controls>
        </NodeGraph.Viewport>
      </NodeGraph.Root>
      <output hidden data-audit-motion>
        {trace}
      </output>
      <output hidden data-audit-graph>
        {JSON.stringify({ nodes, edges })}
      </output>
    </div>
  )
}
