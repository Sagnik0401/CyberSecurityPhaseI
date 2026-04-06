import React, { useMemo, useState } from 'react'
import { useSimulatorStore } from '../store/useSimulatorStore'

export default function EventLogConsole() {
  const logs = useSimulatorStore((s) => s.logs)
  const nodes = useSimulatorStore((s) => s.nodes)

  const [filters, setFilters] = useState({
    severity: 'all',
    node: 'all',
    eventType: 'all',
    timeText: '',
  })

  const eventTypes = useMemo(
    () => Array.from(new Set(logs.map((log) => log.eventType))).sort(),
    [logs]
  )

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filters.severity !== 'all' && log.severity !== filters.severity) return false
      if (filters.node !== 'all' && log.node !== filters.node) return false
      if (filters.eventType !== 'all' && log.eventType !== filters.eventType) return false
      if (filters.timeText && !log.timestamp.includes(filters.timeText)) return false
      return true
    })
  }, [logs, filters])

  return (
    <div className="panel log-panel">
      <div className="panel-header">Security Event Logs</div>

      <div className="filter-row">
        <select
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="all">all severity</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>

        <select value={filters.node} onChange={(e) => setFilters({ ...filters, node: e.target.value })}>
          <option value="all">all nodes</option>
          {nodes.map((node) => (
            <option key={node.id} value={node.id}>
              {node.id}
            </option>
          ))}
        </select>

        <select
          value={filters.eventType}
          onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
        >
          <option value="all">all events</option>
          {eventTypes.map((eventType) => (
            <option key={eventType} value={eventType}>
              {eventType}
            </option>
          ))}
        </select>

        <input
          placeholder="time contains..."
          value={filters.timeText}
          onChange={(e) => setFilters({ ...filters, timeText: e.target.value })}
        />
      </div>

      <div className="log-console">
        {filtered.length === 0 ? (
          <div className="log-line">No events match current filters.</div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className={`log-line log-${log.severity}`}>
              [{log.timestamp}] {log.eventType} :: {log.node} :: {renderLogDetails(log.details)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function renderLogDetails(details) {
  // Check if details contains [LETHAL] tag and render it with special styling
  if (details.includes('[LETHAL]')) {
    const parts = details.split('[LETHAL]')
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="log-lethal">[LETHAL]</span>}
            {part}
          </React.Fragment>
        ))}
      </>
    )
  }
  return details
}
