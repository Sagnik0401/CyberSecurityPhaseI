import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSimulatorStore } from '../store/useSimulatorStore'

function ChartCard({ title, data, dataKey, color, unit = '' }) {
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 12, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} unit={unit} />
          <Tooltip
            contentStyle={{
              background: '#0b1220',
              border: '1px solid #243042',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function DashboardCharts() {
  const analyticsData = useSimulatorStore((s) => s.analyticsData)
  const metrics = useSimulatorStore((s) => s.metrics)

  return (
    <div className="panel chart-panel">
      <div className="panel-header">Analytics Dashboard</div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total attacks launched</div>
          <div className="metric-value">{metrics.totalAttacks}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Attacks blocked</div>
          <div className="metric-value">{metrics.attacksBlocked}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Nodes infected</div>
          <div className="metric-value">{metrics.nodesInfected}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Nodes protected</div>
          <div className="metric-value">{metrics.nodesProtected}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active alerts</div>
          <div className="metric-value">{metrics.activeAlerts}</div>
        </div>
      </div>

      <div className="chart-grid">
        <ChartCard
          title="Attack Frequency Chart"
          data={analyticsData.attackFrequency}
          dataKey="count"
          color="#ef4444"
        />
        <ChartCard
          title="Infected Node Timeline"
          data={analyticsData.infectedTimeline}
          dataKey="infected"
          color="#facc15"
        />
        <ChartCard
          title="Defense Effectiveness Chart"
          data={analyticsData.defenseEffectiveness}
          dataKey="rate"
          color="#38bdf8"
          unit="%"
        />
      </div>
    </div>
  )
}
