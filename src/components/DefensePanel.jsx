import React, { useMemo, useState } from 'react'
import { DEFENSE_TYPES, NODE_TYPES } from '../engine/networkUtils'
import { useSimulatorStore } from '../store/useSimulatorStore'

export default function DefensePanel() {
  const nodes = useSimulatorStore((s) => s.nodes)
  const selectedNodeId = useSimulatorStore((s) => s.selectedNodeId)
  const addDefenseToNode = useSimulatorStore((s) => s.addDefenseToNode)
  const addNode = useSimulatorStore((s) => s.addNode)
  const deleteSelectedNode = useSimulatorStore((s) => s.deleteSelectedNode)
  const updateNodeData = useSimulatorStore((s) => s.updateNodeData)

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )
  const [defenseType, setDefenseType] = useState(DEFENSE_TYPES[0])
  const [nodeType, setNodeType] = useState(NODE_TYPES[0])

  return (
    <div className="panel control-panel">
      <div className="panel-header">Defense Controls</div>

      <div className="field-group">
        <label>Add Device Node</label>
        <div className="field-row">
          <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
            {NODE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => addNode(nodeType)}>
            Add
          </button>
        </div>
      </div>

      <div className="field-group">
        <label>Selected Node</label>
        <input readOnly value={selectedNode?.id || 'No node selected'} />
      </div>

      <div className="field-group">
        <label>Security Level</label>
        <input
          type="number"
          min="1"
          max="5"
          value={selectedNode?.data.securityLevel ?? 1}
          onChange={(e) =>
            selectedNode &&
            updateNodeData(selectedNode.id, {
              securityLevel: Number(e.target.value) || 1,
            })
          }
          disabled={!selectedNode}
        />
      </div>

      <div className="field-group">
        <label>Deploy Defense</label>
        <div className="field-row">
          <select value={defenseType} onChange={(e) => setDefenseType(e.target.value)}>
            {DEFENSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className="btn"
            disabled={!selectedNode}
            onClick={() => selectedNode && addDefenseToNode(selectedNode.id, defenseType)}
          >
            Deploy
          </button>
        </div>
      </div>

      <button className="btn btn-muted" disabled={!selectedNode} onClick={deleteSelectedNode}>
        Delete Selected Node
      </button>
    </div>
  )
}
