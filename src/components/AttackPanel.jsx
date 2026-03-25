import React, { useMemo, useState } from 'react'
import { ATTACK_TYPES } from '../engine/networkUtils'
import { useSimulatorStore } from '../store/useSimulatorStore'

export default function AttackPanel() {
  const nodes = useSimulatorStore((s) => s.nodes)
  const launchAttack = useSimulatorStore((s) => s.launchAttack)

  const nodeOptions = useMemo(() => nodes.map((n) => n.id), [nodes])
  const [form, setForm] = useState({
    type: ATTACK_TYPES[2],
    originNode: 'internet_1',
    targetNode: 'server_1',
    strength: 3,
    port: 80,
    spreadRate: 0.6,
  })

  return (
    <div className="panel control-panel">
      <div className="panel-header">Attack Controls</div>
      <div className="field-group">
        <label>Attack Type</label>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {ATTACK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label>Origin Node</label>
        <select
          value={form.originNode}
          onChange={(e) => setForm({ ...form, originNode: e.target.value })}
        >
          {nodeOptions.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label>Target Node</label>
        <select
          value={form.targetNode}
          onChange={(e) => setForm({ ...form, targetNode: e.target.value })}
        >
          {nodeOptions.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label>Strength</label>
          <input
            type="number"
            min="1"
            max="10"
            value={form.strength}
            onChange={(e) => setForm({ ...form, strength: e.target.value })}
          />
        </div>
        <div className="field-group">
          <label>Port</label>
          <input
            type="number"
            min="1"
            max="65535"
            value={form.port}
            onChange={(e) => setForm({ ...form, port: e.target.value })}
          />
        </div>
      </div>

      <div className="field-group">
        <label>Spread Rate ({form.spreadRate})</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={form.spreadRate}
          onChange={(e) => setForm({ ...form, spreadRate: e.target.value })}
        />
      </div>

      <button className="btn btn-danger" onClick={() => launchAttack(form)}>
        Launch Attack
      </button>
    </div>
  )
}
