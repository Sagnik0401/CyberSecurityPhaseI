import React from 'react'
import NetworkGraph from '../components/NetworkGraph'
import DefensePanel from '../components/DefensePanel'

export default function BuilderPage() {
  return (
    <div className="soc-grid">
      <NetworkGraph />
      <DefensePanel />
    </div>
  )
}
