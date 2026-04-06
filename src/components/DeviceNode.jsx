import React from 'react'
import { Handle, Position } from 'reactflow'

const STATUS_COLOR = {
  secure: '#22c55e',
  under_attack: '#facc15',
  compromised: '#ef4444',
  protected: '#38bdf8',
  healing: '#8b5cf6',
}

export default function DeviceNode({ data, selected }) {
  const color = STATUS_COLOR[data.status] || STATUS_COLOR.secure
  const defenseCount = (data.defenses || []).length
  const healingProgress = data.healingProgress || 0

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className={`device-node ${data.status === 'compromised' ? 'danger-pulse' : ''} ${data.status === 'healing' ? 'healing-pulse' : ''} ${selected ? 'selected' : ''}`}
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
        {data.status === 'healing' && (
          <div className="healing-progress">
            <div className="healing-bar">
              <div 
                className="healing-fill" 
                style={{ width: `${healingProgress}%` }}
              />
            </div>
            <span className="healing-text">{healingProgress}%</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  )
}
