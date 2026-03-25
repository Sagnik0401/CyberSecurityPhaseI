import React, { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import DeviceNode from './DeviceNode'
import { useSimulatorStore } from '../store/useSimulatorStore'

const nodeTypes = { deviceNode: DeviceNode }

export default function NetworkGraph() {
  const nodes = useSimulatorStore((s) => s.nodes)
  const edges = useSimulatorStore((s) => s.edges)
  const infectedEdgeIds = useSimulatorStore((s) => s.infectedEdgeIds)
  const onNodesChange = useSimulatorStore((s) => s.onNodesChange)
  const onEdgesChange = useSimulatorStore((s) => s.onEdgesChange)
  const onConnect = useSimulatorStore((s) => s.onConnect)
  const setSelectedNode = useSimulatorStore((s) => s.setSelectedNode)

  const styledEdges = useMemo(() => {
    const infectedSet = new Set(infectedEdgeIds)
    return edges.map((edge) => {
      const key = [edge.source, edge.target].sort().join('__')
      const infected = infectedSet.has(key)
      return {
        ...edge,
        animated: infected,
        style: {
          stroke: infected ? '#ef4444' : '#1f2937',
          strokeWidth: infected ? 2.5 : 1.7,
        },
      }
    })
  }, [edges, infectedEdgeIds])

  return (
    <ReactFlowProvider>
      <div className="panel graph-panel">
        <div className="panel-header">Network Graph Canvas</div>
        <div className="graph-wrap">
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            fitView
            className="cyber-flow"
          >
            <Background color="#1f2937" gap={20} />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  )
}
