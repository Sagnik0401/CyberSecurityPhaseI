import React, { useEffect } from 'react'
import BuilderPage from './pages/BuilderPage'
import DashboardPage from './pages/DashboardPage'
import SimulatorPage from './pages/SimulatorPage'
import { useSimulatorStore } from './store/useSimulatorStore'
import { startSimulationLoop } from './engine/simulationLoop'
import './App.css'

export default function App() {
  const tickMs = useSimulatorStore((s) => s.simulationStatus.tickMs)
  const running = useSimulatorStore((s) => s.simulationStatus.running)
  const processTick = useSimulatorStore((s) => s.processTick)

  useEffect(() => {
    if (!running) return undefined
    const stop = startSimulationLoop(processTick, tickMs)
    return () => stop()
  }, [running, tickMs, processTick])

  return (
    <div className="app-shell">
      <header className="soc-header">
        <h1>CyberRange Simulator</h1>
        <p>Interactive Cyber Attack & Defense Simulation Platform</p>
      </header>

      <main>
        <section className="top-grid">
          <BuilderPage />
          <SimulatorPage />
        </section>
        <DashboardPage />
      </main>
    </div>
  )
}
