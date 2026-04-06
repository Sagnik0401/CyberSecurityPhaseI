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

// Attack effectiveness by node type (0-1 multiplier)
const ATTACK_EFFECTIVENESS = {
  'ddos': {
    'server': 0.9,      // High impact on servers
    'database': 0.6,    // Medium impact on databases  
    'router': 0.3,      // Low impact on routers
    'firewall': 0.2,    // Very low on firewalls
    'workstation': 0.4, // Low-medium on workstations
    'internet-gateway': 0.7, // High on gateways
  },
  'malware-spread': {
    'workstation': 0.9,  // Very high on workstations
    'server': 0.8,       // High on servers
    'router': 0.5,       // Medium on routers
    'database': 0.4,     // Low-medium on databases
    'firewall': 0.2,     // Very low on firewalls
    'internet-gateway': 0.3, // Low on gateways
  },
  'sql-injection': {
    'database': 0.95,    // Critical impact on databases
    'server': 0.3,       // Low on servers (if they connect to DB)
    'router': 0.1,       // Very low on routers
    'firewall': 0.05,    // Almost none on firewalls
    'workstation': 0.2,  // Very low on workstations
    'internet-gateway': 0.1, // Very low on gateways
  },
  'brute-force': {
    'workstation': 0.7,  // High on workstations (weak passwords)
    'server': 0.6,       // Medium-high on servers
    'database': 0.8,     // High on databases (default passwords)
    'router': 0.4,       // Medium on routers
    'firewall': 0.3,     // Low-medium on firewalls
    'internet-gateway': 0.5, // Medium on gateways
  },
  'port-scan': {
    'server': 0.8,       // High on servers (many services)
    'router': 0.6,       // Medium-high on routers
    'firewall': 0.7,     // High on firewalls (many ports)
    'database': 0.5,     // Medium on databases
    'workstation': 0.4,   // Low-medium on workstations
    'internet-gateway': 0.9, // Very high on gateways
  },
  'insider-attack': {
    'workstation': 0.9,  // Very high (insider access)
    'server': 0.8,       // High (privilege escalation)
    'database': 0.85,    // Very high (data access)
    'router': 0.6,       // Medium (network access)
    'firewall': 0.4,     // Low-medium (config access)
    'internet-gateway': 0.3, // Low (limited access)
  },
}

// Lethal attack combinations (only the most dangerous ones)
const LETHAL_COMBINATIONS = {
  'sql-injection': ['database'], // 95% - Critical data breach
  'insider-attack': ['database', 'workstation'], // 85%, 90% - Internal threat
  'malware-spread': ['workstation'], // 90% - Widespread infection
  'ddos': ['server'], // 90% - Service disruption
}

function getAttackEffectiveness(attackType, nodeType) {
  const effectivenessMap = ATTACK_EFFECTIVENESS[attackType]
  if (!effectivenessMap) return 0.5 // Default 50% if attack type not found
  
  return effectivenessMap[nodeType] || 0.3 // Default 30% if node type not found
}

function isLethalAttack(attackType, nodeType) {
  const lethalNodes = LETHAL_COMBINATIONS[attackType]
  if (!lethalNodes) return false
  
  return lethalNodes.includes(nodeType)
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
        // Get attack effectiveness for this node type
        const attackEffectiveness = getAttackEffectiveness(attack.type, targetNode.data.type)
        const isLethal = isLethalAttack(attack.type, targetNode.data.type)
        
        // Disrupt healing if node is currently healing
        if (targetNode.data.status === 'healing') {
          markNodeStatus(currentId, 'compromised', true)
          logEvent({
            eventType: 'healing_disrupted',
            node: currentId,
            severity: 'warning',
            details: `Healing disrupted on ${currentId} due to new attack`,
          })
          updateMetrics('activeAlerts', 1)
        }

        // Modify attack strength based on node type effectiveness
        const modifiedAttack = {
          ...attack,
          strength: (attack.strength || 3) * attackEffectiveness
        }

        const defenseResult = evaluateDefenses(targetNode.data, modifiedAttack, {
          fromNodeId: attack.originNode,
          fromNodeType: nodeById(nodes, attack.originNode)?.data?.type,
        })

        if (defenseResult.blocked) {
          const lethalTag = isLethal ? '[LETHAL] ' : ''
          markNodeStatus(currentId, 'protected', false)
          logEvent({
            eventType: 'attack_blocked',
            node: currentId,
            severity: 'info',
            details: `${lethalTag}${defenseResult.reason} (Attack effectiveness: ${Math.round(attackEffectiveness * 100)}%)`,
          })
          updateMetrics('attacksBlocked', 1)
          updateMetrics('nodesProtected', 1)
          return
        }

        infectedNodes.add(currentId)
        markNodeStatus(currentId, 'compromised', true)
        updateMetrics('nodesInfected', 1)
        updateMetrics('activeAlerts', 1)
        
        const lethalTag = isLethal ? '[LETHAL] ' : ''
        logEvent({
          eventType: 'node_infected',
          node: currentId,
          severity: 'critical',
          details: `${lethalTag}${currentId} compromised by ${formatAttackLabel(attack.type)} (Effectiveness: ${Math.round(attackEffectiveness * 100)}%)`,
        })
      }

      const neighbors = adjacency[currentId] || []
      neighbors.forEach((neighborId) => {
        if (infectedNodes.has(neighborId)) return
        if (!chance(attack.spreadRate ?? 0.5)) return

        infectedEdgeIds.add([currentId, neighborId].sort().join('__'))

        const neighborNode = nodeById(nodes, neighborId)
        if (!neighborNode) return

        // Get attack effectiveness for lateral spread
        const lateralEffectiveness = getAttackEffectiveness(attack.type, neighborNode.data.type)
        const isLethal = isLethalAttack(attack.type, neighborNode.data.type)
        
        // Modify attack strength for lateral spread
        const lateralAttack = {
          ...attack,
          strength: (attack.strength || 3) * lateralEffectiveness
        }

        const defenseResult = evaluateDefenses(neighborNode.data, lateralAttack, {
          fromNodeId: currentId,
          fromNodeType: targetNode.data.type,
        })

        if (defenseResult.blocked) {
          const lethalTag = isLethal ? '[LETHAL] ' : ''
          markNodeStatus(neighborId, 'protected', false)
          logEvent({
            eventType: 'lateral_blocked',
            node: neighborId,
            severity: 'warning',
            details: `${lethalTag}${neighborId} resisted spread from ${currentId}: ${defenseResult.reason} (Effectiveness: ${Math.round(lateralEffectiveness * 100)}%)`,
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
