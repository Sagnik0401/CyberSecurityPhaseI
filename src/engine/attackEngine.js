import { buildAdjacency, chance } from './networkUtils'
import { evaluateDefenses } from './defenseEngine'

function nodeById(nodes, id) {
  return nodes.find((node) => node.id === id)
}

function formatAttackLabel(type) {
  return String(type || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function processAttackTick({ nodes, edges, activeAttacks, logEvent, markNodeStatus, updateMetrics }) {
  const adjacency = buildAdjacency(nodes, edges)
  const infectedEdgeIds = new Set()
  const nextAttacks = []

  activeAttacks.forEach((attack) => {
    const infectedNodes = new Set(attack.infectedNodes || [])
    let frontier = new Set(attack.frontier || [])

    if (frontier.size === 0) {
      frontier.add(attack.targetNode)
      logEvent({
        eventType: 'attack_launched',
        node: attack.targetNode,
        severity: 'warning',
        details: `Attack launched: ${formatAttackLabel(attack.type)} from ${attack.originNode} to ${attack.targetNode}`,
      })
      updateMetrics('totalAttacks', 1)
    }

    const newFrontier = new Set()

    frontier.forEach((currentId) => {
      const targetNode = nodeById(nodes, currentId)
      if (!targetNode) return

      if (!infectedNodes.has(currentId)) {
        const defenseResult = evaluateDefenses(targetNode.data, attack, {
          fromNodeId: attack.originNode,
          fromNodeType: nodeById(nodes, attack.originNode)?.data?.type,
        })

        if (defenseResult.blocked) {
          markNodeStatus(currentId, 'protected', false)
          logEvent({
            eventType: 'attack_blocked',
            node: currentId,
            severity: 'info',
            details: defenseResult.reason,
          })
          updateMetrics('attacksBlocked', 1)
          updateMetrics('nodesProtected', 1)
          return
        }

        infectedNodes.add(currentId)
        markNodeStatus(currentId, 'compromised', true)
        updateMetrics('nodesInfected', 1)
        updateMetrics('activeAlerts', 1)
        logEvent({
          eventType: 'node_infected',
          node: currentId,
          severity: 'critical',
          details: `${currentId} compromised by ${formatAttackLabel(attack.type)}`,
        })
      }

      const neighbors = adjacency[currentId] || []
      neighbors.forEach((neighborId) => {
        if (infectedNodes.has(neighborId)) return
        if (!chance(attack.spreadRate ?? 0.5)) return

        infectedEdgeIds.add([currentId, neighborId].sort().join('__'))

        const neighborNode = nodeById(nodes, neighborId)
        if (!neighborNode) return

        const defenseResult = evaluateDefenses(neighborNode.data, attack, {
          fromNodeId: currentId,
          fromNodeType: targetNode.data.type,
        })

        if (defenseResult.blocked) {
          markNodeStatus(neighborId, 'protected', false)
          logEvent({
            eventType: 'lateral_blocked',
            node: neighborId,
            severity: 'warning',
            details: `${neighborId} resisted spread from ${currentId}: ${defenseResult.reason}`,
          })
          updateMetrics('attacksBlocked', 1)
          return
        }

        markNodeStatus(neighborId, 'under_attack', false)
        newFrontier.add(neighborId)
      })
    })

    const stillActive = newFrontier.size > 0
    if (stillActive) {
      nextAttacks.push({
        ...attack,
        frontier: Array.from(newFrontier),
        infectedNodes: Array.from(infectedNodes),
      })
    } else {
      logEvent({
        eventType: 'attack_complete',
        node: attack.targetNode,
        severity: 'info',
        details: `${formatAttackLabel(attack.type)} propagation ended`,
      })
    }
  })

  return {
    nextAttacks,
    infectedEdgeIds: Array.from(infectedEdgeIds),
  }
}
