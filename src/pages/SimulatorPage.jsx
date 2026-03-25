import React from 'react'
import AttackPanel from '../components/AttackPanel'
import SimulationControls from '../components/SimulationControls'

export default function SimulatorPage() {
  return (
    <div className="side-stack">
      <AttackPanel />
      <SimulationControls />
    </div>
  )
}
