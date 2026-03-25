import React from 'react'
import { useSimulatorStore } from '../store/useSimulatorStore'

export default function SimulationControls() {
  const simulationStatus = useSimulatorStore((s) => s.simulationStatus)
  const activeAttacks = useSimulatorStore((s) => s.activeAttacks)
  const startSimulation = useSimulatorStore((s) => s.startSimulation)
  const pauseSimulation = useSimulatorStore((s) => s.pauseSimulation)
  const resetSimulation = useSimulatorStore((s) => s.resetSimulation)
  const setTickMs = useSimulatorStore((s) => s.setTickMs)

  return (
    <div className="panel control-panel">
      <div className="panel-header">Simulation Panel</div>

      <div className="metric-grid compact">
        <div className="metric-card">
          <div className="metric-label">Running</div>
          <div className="metric-value">{simulationStatus.running ? 'Yes' : 'No'}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Attacks</div>
          <div className="metric-value">{activeAttacks.length}</div>
        </div>
      </div>

      <div className="field-group">
        <label>Tick Interval (ms)</label>
        <input
          type="number"
          min="500"
          step="100"
          value={simulationStatus.tickMs}
          onChange={(e) => setTickMs(e.target.value)}
        />
      </div>

      <div className="field-row">
        <button className="btn" onClick={startSimulation}>
          Start
        </button>
        <button className="btn btn-muted" onClick={pauseSimulation}>
          Pause
        </button>
        <button className="btn btn-danger" onClick={resetSimulation}>
          Reset
        </button>
      </div>
    </div>
  )
}
