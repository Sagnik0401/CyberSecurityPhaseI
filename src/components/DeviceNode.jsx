import React from 'react'
import { Handle, Position } from 'reactflow'

const STATUS_COLOR = {
  secure: '#22c55e',
  under_attack: '#facc15',
  compromised: '#ef4444',
  protected: '#38bdf8',
}

export default function DeviceNode({ data, selected }) {
  const color = STATUS_COLOR[data.status] || STATUS_COLOR.secure
  const defenseCount = (data.defenses || []).length

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={`device-node ${data.status === 'compromised' ? 'danger-pulse' : ''} ${selected ? 'selected' : ''}`}
        style={{ '--node-color': color }}
      >
        <div className="device-title">{data.label || data.type}</div>
        <div className="device-meta">
          <span>{data.type}</span>
          <span>Sec {data.securityLevel}</span>
        </div>
        <div className="device-meta">
          <span>Defenses: {defenseCount}</span>
          <span>{data.status.replace('_', ' ')}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  )
}
