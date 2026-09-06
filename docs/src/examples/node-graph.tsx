import * as React from "react"
import {
  NodeGraph,
  NodeGraphBackground,
  NodeGraphConnectionLine,
  NodeGraphControls,
  NodeGraphEdge,
  NodeGraphEdges,
  NodeGraphFitViewTrigger,
  NodeGraphNode,
  NodeGraphNodeBody,
  NodeGraphNodeHeader,
  NodeGraphNodeInputs,
  NodeGraphNodeOutputs,
  NodeGraphNodeTitle,
  NodeGraphPort,
  NodeGraphPortLabel,
  NodeGraphPortPin,
  NodeGraphSurface,
  NodeGraphViewport,
  NodeGraphZoomInTrigger,
  NodeGraphZoomOutTrigger,
  NodeGraphZoomValue,
} from "@/components/ui/node-graph"

type Port = { id: string; label: string; type: "number" | "string" }
type Node = { id: string; title: string; position: { x: number; y: number }; inputs: Port[]; outputs: Port[] }
type Edge = { id: string; source: { nodeId: string; portId: string }; target: { nodeId: string; portId: string } }

const pinColor = { number: "text-emerald-500", string: "text-fuchsia-500" }

export default function NodeGraphExample() {
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
    <NodeGraph
      onNodesMove={(moves) =>
        setNodes((prev) =>
          prev.map((n) => ({ ...n, position: moves.find((m) => m.id === n.id)?.position ?? n.position }))
        )
      }
      onConnect={({ source, target }) => setEdges((prev) => [...prev, { id: `e${prev.length + 1}`, source, target }])}
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
      <NodeGraphViewport>
        <NodeGraphBackground />
        <NodeGraphSurface>
          <NodeGraphEdges>
            {edges.map((edge) => (
              <NodeGraphEdge
                key={edge.id}
                value={edge.id}
                source={edge.source}
                target={edge.target}
                className="text-emerald-500"
              />
            ))}
          </NodeGraphEdges>
          <NodeGraphConnectionLine />
          {nodes.map((node) => (
            <NodeGraphNode key={node.id} value={node.id} position={node.position}>
              <NodeGraphNodeHeader>
                <NodeGraphNodeTitle>{node.title}</NodeGraphNodeTitle>
              </NodeGraphNodeHeader>
              <NodeGraphNodeBody>
                <NodeGraphNodeInputs>
                  {node.inputs.map((pin) => (
                    <NodeGraphPort
                      key={pin.id}
                      value={pin.id}
                      side="input"
                      type={pin.type}
                      connected={connected(node.id, pin.id)}
                    >
                      <NodeGraphPortPin className={pinColor[pin.type]} />
                      <NodeGraphPortLabel>{pin.label}</NodeGraphPortLabel>
                    </NodeGraphPort>
                  ))}
                </NodeGraphNodeInputs>
                <NodeGraphNodeOutputs>
                  {node.outputs.map((pin) => (
                    <NodeGraphPort
                      key={pin.id}
                      value={pin.id}
                      side="output"
                      type={pin.type}
                      connected={connected(node.id, pin.id)}
                    >
                      <NodeGraphPortLabel>{pin.label}</NodeGraphPortLabel>
                      <NodeGraphPortPin className={pinColor[pin.type]} />
                    </NodeGraphPort>
                  ))}
                </NodeGraphNodeOutputs>
              </NodeGraphNodeBody>
            </NodeGraphNode>
          ))}
        </NodeGraphSurface>
        <NodeGraphControls>
          <NodeGraphZoomOutTrigger />
          <NodeGraphZoomValue />
          <NodeGraphZoomInTrigger />
          <NodeGraphFitViewTrigger />
        </NodeGraphControls>
      </NodeGraphViewport>
    </NodeGraph>
  )
}
