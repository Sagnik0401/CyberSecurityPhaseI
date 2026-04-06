import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import { processAttackTick } from '../engine/attackEngine'
import {
  ATTACK_TYPES,
  DEFENSE_TYPES,
  NODE_TYPES,
  getStatusFromNode,
  normalizeType,
  nowTime,
  randomId,
  toConnections,
} from '../engine/networkUtils'

const defaultNodes = [
  {
    id: 'internet_1',
    position: { x: 40, y: 140 },
    type: 'deviceNode',
    data: {
      id: 'internet_1',
      type: 'internet-gateway',
      status: 'secure',
      securityLevel: 1,
      isInfected: false,
      defenses: [],
      connections: ['firewall_1'],
      label: 'Internet Gateway',
    },
  },
  {
    id: 'firewall_1',
    position: { x: 280, y: 140 },
    type: 'deviceNode',
    data: {
      id: 'firewall_1',
      type: 'firewall',
      status: 'protected',
      securityLevel: 4,
      isInfected: false,
      defenses: [{ type: 'firewall', ports: [22, 3389], effectiveness: 0.8 }],
      connections: ['internet_1', 'router_1'],
      label: 'Edge Firewall',
    },
  },
  {
    id: 'router_1',
    position: { x: 520, y: 140 },
    type: 'deviceNode',
    data: {
      id: 'router_1',
      type: 'router',
      status: 'secure',
      securityLevel: 3,
      isInfected: false,
      defenses: [{ type: 'intrusion-detection-system', effectiveness: 0.35 }],
      connections: ['firewall_1', 'server_1'],
      label: 'Core Router',
    },
  },
  {
    id: 'server_1',
    position: { x: 760, y: 90 },
    type: 'deviceNode',
    data: {
      id: 'server_1',
      type: 'server',
      status: 'secure',
      securityLevel: 2,
      isInfected: false,
      defenses: [{ type: 'antivirus', effectiveness: 0.7 }],
      connections: ['router_1', 'database_1'],
      label: 'App Server',
    },
  },
  {
    id: 'database_1',
    position: { x: 1010, y: 190 },
    type: 'deviceNode',
    data: {
      id: 'database_1',
      type: 'database',
      status: 'secure',
      securityLevel: 2,
      isInfected: false,
      defenses: [{ type: 'patch-update', effectiveness: 0.3 }],
      connections: ['server_1'],
      label: 'Primary DB',
    },
  },
]

const defaultEdges = [
  { id: 'e1', source: 'internet_1', target: 'firewall_1', type: 'smoothstep' },
  { id: 'e2', source: 'firewall_1', target: 'router_1', type: 'smoothstep' },
  { id: 'e3', source: 'router_1', target: 'server_1', type: 'smoothstep' },
  { id: 'e4', source: 'server_1', target: 'database_1', type: 'smoothstep' },
]

const initialState = {
  nodes: defaultNodes,
  edges: defaultEdges,
  selectedNodeId: null,
  activeAttacks: [],
  infectedEdgeIds: [],
  simulationStatus: {
    running: false,
    tickMs: 2000,
    lastTick: null,
  },
  logs: [],
  metrics: {
    totalAttacks: 0,
    attacksBlocked: 0,
    nodesInfected: 0,
    nodesProtected: 0,
    activeAlerts: 0,
  },
  analyticsData: {
    attackFrequency: [],
    infectedTimeline: [],
    defenseEffectiveness: [],
  },
}

function hydrateConnections(nodes, edges) {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      status: getStatusFromNode(node.data),
      connections: toConnections(edges, node.id),
    },
  }))
}

export const useSimulatorStore = create((set, get) => ({
  ...initialState,

  onNodesChange: (changes) => {
    set((state) => {
      const nextNodes = applyNodeChanges(changes, state.nodes)
      return { nodes: hydrateConnections(nextNodes, state.edges) }
    })
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges)
      return {
        edges: nextEdges,
        nodes: hydrateConnections(state.nodes, nextEdges),
      }
    })
  },

  onConnect: (params) => {
    set((state) => {
      const nextEdges = addEdge({ ...params, type: 'smoothstep' }, state.edges)
      return {
        edges: nextEdges,
        nodes: hydrateConnections(state.nodes, nextEdges),
      }
    })
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  deleteSelectedNode: () => {
    set((state) => {
      if (!state.selectedNodeId) return state
      const nextNodes = state.nodes.filter((node) => node.id !== state.selectedNodeId)
      const nextEdges = state.edges.filter(
        (edge) => edge.source !== state.selectedNodeId && edge.target !== state.selectedNodeId
      )
      return {
        nodes: hydrateConnections(nextNodes, nextEdges),
        edges: nextEdges,
        selectedNodeId: null,
      }
    })
  },

  addNode: (rawType) => {
    const type = normalizeType(rawType)
    if (!NODE_TYPES.includes(type)) return

    const nodeId = randomId(type.replace('-', '_'))
    const position = {
      x: 100 + Math.random() * 900,
      y: 80 + Math.random() * 400,
    }

    const newNode = {
      id: nodeId,
      position,
      type: 'deviceNode',
      data: {
        id: nodeId,
        type,
        status: 'secure',
        securityLevel: 1,
        isInfected: false,
        defenses: [],
        connections: [],
        label: type.replace('-', ' '),
      },
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
      logs: [
        {
          id: randomId('log'),
          timestamp: nowTime(),
          eventType: 'node_added',
          node: nodeId,
          details: `Added ${type} node`,
          severity: 'info',
        },
        ...state.logs,
      ],
    }))
  },

  updateNodeData: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...patch,
              },
            }
          : node
      ),
    }))
  },

  addDefenseToNode: (nodeId, defenseType) => {
    const type = normalizeType(defenseType)
    if (!DEFENSE_TYPES.includes(type)) return

    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        if ((node.data.defenses || []).some((d) => d.type === type)) return node

        const config = {
          firewall: { type: 'firewall', ports: [22, 3389], effectiveness: 0.8 },
          antivirus: { type: 'antivirus', effectiveness: 0.7 },
          'intrusion-detection-system': { type: 'intrusion-detection-system', effectiveness: 0.35 },
          'patch-update': { type: 'patch-update', effectiveness: 0.3 },
          'network-segmentation': { type: 'network-segmentation', effectiveness: 0.65 },
        }[type]

        return {
          ...node,
          data: {
            ...node.data,
            defenses: [...(node.data.defenses || []), config],
            status: 'protected',
          },
        }
      }),
      logs: [
        {
          id: randomId('log'),
          timestamp: nowTime(),
          eventType: 'defense_deployed',
          node: nodeId,
          details: `Deployed ${type} on ${nodeId}`,
          severity: 'info',
        },
        ...state.logs,
      ],
    }))
  },

  launchAttack: (attack) => {
    const type = normalizeType(attack.type)
    if (!ATTACK_TYPES.includes(type)) return

    const payload = {
      id: randomId('attack'),
      type,
      originNode: attack.originNode,
      targetNode: attack.targetNode,
      strength: Number(attack.strength) || 2,
      port: Number(attack.port) || 80,
      spreadRate: Number(attack.spreadRate) || 0.5,
      frontier: [],
      infectedNodes: [],
    }

    set((state) => ({
      activeAttacks: [...state.activeAttacks, payload],
    }))
  },

  logEvent: (entry) => {
    set((state) => ({
      logs: [
        {
          id: randomId('log'),
          timestamp: nowTime(),
          eventType: entry.eventType,
          node: entry.node,
          details: entry.details,
          severity: entry.severity,
        },
        ...state.logs,
      ].slice(0, 500),
    }))
  },

  updateMetrics: (key, delta) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        [key]: Math.max(0, (state.metrics[key] || 0) + delta),
      },
    }))
  },

  markNodeStatus: (nodeId, status, infected) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                status,
                isInfected: infected,
              },
            }
          : node
      ),
    }))
  },

  healNode: (nodeId) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (!node) return state
      
      if (!node.data.isInfected && node.data.status !== 'compromised') {
        return state // Node is already healthy
      }

      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'secure',
                  isInfected: false,
                  healingProgress: 100,
                },
              }
            : n
        ),
        logs: [
          {
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'node_healed',
            node: nodeId,
            details: `Node ${nodeId} has been healed and restored to secure status`,
            severity: 'success',
          },
          ...state.logs,
        ],
        metrics: {
          ...state.metrics,
          nodesInfected: Math.max(0, state.metrics.nodesInfected - 1),
        },
      }
    })
  },

  startAutoHeal: (nodeId) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (!node) {
        console.log(`[DEBUG] startAutoHeal: Node ${nodeId} not found`)
        return state
      }
      
      if (!node.data.isInfected && node.data.status !== 'compromised') {
        console.log(`[DEBUG] startAutoHeal: Node ${nodeId} is already healthy (status: ${node.data.status}, infected: ${node.data.isInfected})`)
        return state // Node is already healthy
      }

      console.log(`[DEBUG] startAutoHeal: Starting healing on ${nodeId} (status: ${node.data.status}, infected: ${node.data.isInfected})`)

      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'healing',
                  healingProgress: 0,
                  healingStartTick: Date.now(),
                },
              }
            : n
        ),
        logs: [
          {
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_started',
            node: nodeId,
            details: `Auto-healing started on ${nodeId} (Security Level: ${node.data.securityLevel})`,
            severity: 'info',
          },
          ...state.logs,
        ],
      }
    })
  },

  processAutoHealing: () => {
    set((state) => {
      // Find nodes that should be healing (either status=healing OR infected with progress)
      const healingNodes = state.nodes.filter(n => 
        n.data.status === 'healing' || 
        (n.data.isInfected && n.data.healingProgress !== undefined && n.data.healingProgress > 0)
      )
      
      if (healingNodes.length === 0) return state

      let updatedNodes = [...state.nodes]
      const healingLogs = []

      healingNodes.forEach(node => {
        const currentProgress = node.data.healingProgress || 0
        
        // Variable healing progress based on security level and random factors
        const baseRate = (node.data.securityLevel || 1) * 10 // Lower base rate
        const antivirusBonus = node.data.defenses?.find(d => d.type === 'antivirus') ? 8 : 0
        const randomVariation = Math.floor(Math.random() * 12) - 3 // -3 to +8 variation
        const rareBoost = Math.random() < 0.1 ? Math.floor(Math.random() * 8) + 5 : 0 // 10% chance of big boost
        
        const finalRate = Math.max(3, baseRate + antivirusBonus + randomVariation + rareBoost)
        const newProgress = Math.min(100, currentProgress + finalRate)
        
        // Update node progress and status immediately
        updatedNodes = updatedNodes.map(n => 
          n.id === node.id 
            ? { 
                ...n, 
                data: { 
                  ...n.data, 
                  healingProgress: newProgress,
                  status: newProgress >= 100 ? 'secure' : 'healing' // Ensure proper status
                } 
              }
            : n
        )
        
        // Log healing progress
        if (currentProgress < 50) {
          healingLogs.push({
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_tick',
            node: node.id,
            details: `Healing ${node.id}: ${currentProgress}% → ${newProgress}% (+${finalRate}%)`,
            severity: 'info',
          })
        }

        // Log healing progress at meaningful milestones
        if (newProgress >= 25 && currentProgress < 25) {
          healingLogs.push({
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_progress',
            node: node.id,
            details: `Healing progress: 25% on ${node.id} (+${finalRate}% this tick)`,
            severity: 'info',
          })
        } else if (newProgress >= 50 && currentProgress < 50) {
          healingLogs.push({
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_progress',
            node: node.id,
            details: `Healing progress: 50% on ${node.id} (+${finalRate}% this tick)`,
            severity: 'info',
          })
        } else if (newProgress >= 75 && currentProgress < 75) {
          healingLogs.push({
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_progress',
            node: node.id,
            details: `Healing progress: 75% on ${node.id} (+${finalRate}% this tick)`,
            severity: 'info',
          })
        }

        // Complete healing
        if (newProgress >= 100) {
          updatedNodes = updatedNodes.map(n => 
            n.id === node.id 
              ? { 
                  ...n, 
                  data: { 
                    ...n.data, 
                    status: 'secure', 
                    isInfected: false, 
                    healingProgress: 100 
                  } 
                }
              : n
          )

          healingLogs.push({
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'auto_heal_complete',
            node: node.id,
            details: `Auto-healing completed on ${node.id} (Total progress: ${finalRate}%)`,
            severity: 'success',
          })
        }
      })

      const healedCount = updatedNodes.filter(n => n.data.status === 'secure' && 
        state.nodes.find(old => old.id === n.id && (old.data.isInfected || old.data.status === 'compromised'))).length

      return {
        nodes: updatedNodes, // Use the updated nodes with progress
        logs: [...healingLogs, ...state.logs].slice(0, 500),
        metrics: {
          ...state.metrics,
          nodesInfected: Math.max(0, state.metrics.nodesInfected - healedCount),
        },
      }
    })
  },

  disruptHealing: (nodeId) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId)
      if (!node || node.data.status !== 'healing') return state

      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'compromised',
                  healingProgress: 0,
                },
              }
            : n
        ),
        logs: [
          {
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'healing_disrupted',
            node: nodeId,
            details: `Healing disrupted on ${nodeId} due to new attack`,
            severity: 'warning',
          },
          ...state.logs,
        ],
      }
    })
  },

  healAllNodes: () => {
    set((state) => {
      const infectedNodes = state.nodes.filter(n => n.data.isInfected || n.data.status === 'compromised')
      if (infectedNodes.length === 0) return state

      return {
        nodes: state.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            status: 'secure',
            isInfected: false,
          },
        })),
        logs: [
          {
            id: randomId('log'),
            timestamp: nowTime(),
            eventType: 'mass_heal',
            details: `Mass healing completed: ${infectedNodes.length} nodes restored`,
            severity: 'success',
          },
          ...state.logs,
        ],
        metrics: {
          ...state.metrics,
          nodesInfected: 0,
          activeAlerts: 0,
        },
      }
    })
  },

  processTick: () => {
    const state = get()
    if (!state.simulationStatus.running) return

    // Process attacks and healing simultaneously
    let attackResult = { nextAttacks: [], infectedEdgeIds: state.infectedEdgeIds }
    if (state.activeAttacks.length > 0) {
      attackResult = processAttackTick({
        nodes: state.nodes,
        edges: state.edges,
        activeAttacks: state.activeAttacks,
        logEvent: state.logEvent,
        markNodeStatus: state.markNodeStatus,
        updateMetrics: state.updateMetrics,
      })
    }

    // Start auto-healing for newly infected nodes (simultaneous with attacks)
    const currentNodes = get().nodes // Get fresh node state after attack processing
    console.log(`[DEBUG] Checking ${currentNodes.length} nodes for healing...`)
    
    currentNodes.forEach(node => {
      console.log(`[DEBUG] Node ${node.id}: infected=${node.data.isInfected}, status=${node.data.status}, healingProgress=${node.data.healingProgress}`)
    })
    
    const newlyInfected = currentNodes.filter(node => 
      node.data.isInfected && 
      (node.data.status === 'compromised' || node.data.status === 'under_attack') &&
      !node.data.healingProgress
    )
    
    console.log(`[DEBUG] Found ${newlyInfected.length} newly infected nodes:`, newlyInfected.map(n => n.id))
    
    newlyInfected.forEach(node => {
      console.log(`[DEBUG] Starting auto-heal for ${node.id} (status: ${node.data.status}, infected: ${node.data.isInfected})`)
      get().startAutoHeal(node.id)
    })

    // Process auto-healing (simultaneous with ongoing attacks)
    get().processAutoHealing()

    const infectedCount = get().nodes.filter((node) => node.data.isInfected).length
    const blocked = get().metrics.attacksBlocked
    const total = get().metrics.totalAttacks
    const ratio = total > 0 ? Number(((blocked / total) * 100).toFixed(1)) : 0

    set((curr) => ({
      activeAttacks: attackResult.nextAttacks,
      infectedEdgeIds: attackResult.infectedEdgeIds,
      simulationStatus: {
        ...curr.simulationStatus,
        lastTick: Date.now(),
      },
      analyticsData: {
        attackFrequency: [
          ...curr.analyticsData.attackFrequency.slice(-11),
          { time: nowTime(), count: attackResult.nextAttacks.length },
        ],
        infectedTimeline: [
          ...curr.analyticsData.infectedTimeline.slice(-11),
          { time: nowTime(), infected: infectedCount },
        ],
        defenseEffectiveness: [
          ...curr.analyticsData.defenseEffectiveness.slice(-11),
          { time: nowTime(), rate: ratio },
        ],
      },
    }))
  },

  startSimulation: () => {
    set((state) => ({
      simulationStatus: {
        ...state.simulationStatus,
        running: true,
      },
    }))
  },

  pauseSimulation: () => {
    set((state) => ({
      simulationStatus: {
        ...state.simulationStatus,
        running: false,
      },
    }))
  },

  setTickMs: (value) => {
    const tickMs = Number(value)
    if (!tickMs || tickMs < 500) return
    set((state) => ({
      simulationStatus: {
        ...state.simulationStatus,
        tickMs,
      },
    }))
  },

  resetSimulation: () => {
    set(() => ({
      ...initialState,
      nodes: hydrateConnections(defaultNodes, defaultEdges),
      edges: defaultEdges,
    }))
  },
}))
