import * as React from "react"
import { NodeGraph } from "@/components/ui/node-graph"

type Port = { id: string; label: string; type: "number" | "string" }
type Node = { id: string; title: string; position: { x: number; y: number }; inputs: Port[]; outputs: Port[] }
type Edge = { id: string; source: { nodeId: string; portId: string }; target: { nodeId: string; portId: string } }

const pinColor = { number: "text-emerald-500", string: "text-fuchsia-500" }

export default function NodeGraphExample() {
  const nextEdgeId = React.useRef(3)
  const [nodes, setNodes] = React.useState<Node[]>([
    {
      id: "a",
      title: "Price",
      position: { x: 40, y: 60 },
      inputs: [],
      outputs: [{ id: "out", label: "value", type: "number" }],
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
        { id: "x", label: "a", type: "number" },
        { id: "y", label: "b", type: "number" },
      ],
      outputs: [{ id: "out", label: "result", type: "number" }],
    },
  ])
  const [edges, setEdges] = React.useState<Edge[]>([
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
            {edges.map((edge) => (
              <NodeGraph.Edge
                key={edge.id}
                value={edge.id}
                source={edge.source}
                target={edge.target}
                className="text-emerald-500"
              />
            ))}
          </NodeGraph.Edges>
          <NodeGraph.ConnectionLine />
          {nodes.map((node) => (
            <NodeGraph.Node key={node.id} value={node.id} position={node.position}>
              <NodeGraph.NodeHeader>
                <NodeGraph.NodeTitle>{node.title}</NodeGraph.NodeTitle>
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
                      <NodeGraph.PortPin className={pinColor[pin.type]} />
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
                      <NodeGraph.PortPin className={pinColor[pin.type]} />
                    </NodeGraph.Port>
                  ))}
                </NodeGraph.NodeOutputs>
              </NodeGraph.NodeBody>
            </NodeGraph.Node>
          ))}
        </NodeGraph.Surface>
        <NodeGraph.Controls>
          <NodeGraph.ZoomOutTrigger />
          <NodeGraph.ZoomValue />
          <NodeGraph.ZoomInTrigger />
          <NodeGraph.FitViewTrigger />
        </NodeGraph.Controls>
      </NodeGraph.Viewport>
    </NodeGraph.Root>
  )
}
