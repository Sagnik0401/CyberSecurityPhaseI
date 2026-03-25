export const NODE_TYPES = [
  'workstation',
  'server',
  'database',
  'router',
  'firewall',
  'internet-gateway',
]

export const ATTACK_TYPES = [
  'ddos',
  'brute-force',
  'malware-spread',
  'port-scan',
  'insider-attack',
]

export const DEFENSE_TYPES = [
  'firewall',
  'antivirus',
  'intrusion-detection-system',
  'patch-update',
  'network-segmentation',
]

export function getStatusFromNode(nodeData) {
  if (nodeData.isInfected) return 'compromised'
  if ((nodeData.defenses || []).length > 0) return 'protected'
  return nodeData.status || 'secure'
}

export function toConnections(edges, nodeId) {
  return edges
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .map((edge) => (edge.source === nodeId ? edge.target : edge.source))
}

export function buildAdjacency(nodes, edges) {
  const map = {}
  nodes.forEach((node) => {
    map[node.id] = toConnections(edges, node.id)
  })
  return map
}

export function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

export function chance(probability) {
  return Math.random() < Math.max(0, Math.min(1, probability))
}

export function normalizeType(type) {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}
