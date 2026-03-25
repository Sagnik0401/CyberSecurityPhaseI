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

  processTick: () => {
    const state = get()
    if (!state.simulationStatus.running) return
    if (state.activeAttacks.length === 0) return

    const { nextAttacks, infectedEdgeIds } = processAttackTick({
      nodes: state.nodes,
      edges: state.edges,
      activeAttacks: state.activeAttacks,
      logEvent: state.logEvent,
      markNodeStatus: state.markNodeStatus,
      updateMetrics: state.updateMetrics,
    })

    const infectedCount = get().nodes.filter((node) => node.data.isInfected).length
    const blocked = get().metrics.attacksBlocked
    const total = get().metrics.totalAttacks
    const ratio = total > 0 ? Number(((blocked / total) * 100).toFixed(1)) : 0

    set((curr) => ({
      activeAttacks: nextAttacks,
      infectedEdgeIds,
      simulationStatus: {
        ...curr.simulationStatus,
        lastTick: Date.now(),
      },
      analyticsData: {
        attackFrequency: [
          ...curr.analyticsData.attackFrequency.slice(-11),
          { time: nowTime(), count: curr.activeAttacks.length },
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
