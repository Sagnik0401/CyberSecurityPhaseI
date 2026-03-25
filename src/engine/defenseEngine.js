import { chance } from './networkUtils'

function findDefense(nodeData, type) {
  return (nodeData.defenses || []).find((d) => d.type === type)
}

export function evaluateDefenses(nodeData, attack, context = {}) {
  const firewall = findDefense(nodeData, 'firewall')
  if (firewall && Array.isArray(firewall.ports) && firewall.ports.includes(Number(attack.port))) {
    return {
      blocked: true,
      reason: `Firewall blocked port ${attack.port}`,
      detection: true,
    }
  }

  const segmentation = findDefense(nodeData, 'network-segmentation')
  if (segmentation && context.fromNodeId && context.fromNodeType) {
    const sameZone = context.fromNodeType === nodeData.type
    if (!sameZone && chance(segmentation.effectiveness ?? 0.65)) {
      return {
        blocked: true,
        reason: 'Network segmentation blocked lateral movement',
        detection: true,
      }
    }
  }

  let blockChance = 0

  const antivirus = findDefense(nodeData, 'antivirus')
  if (antivirus && attack.type === 'malware-spread') {
    blockChance += antivirus.effectiveness ?? 0.7
  }

  const ids = findDefense(nodeData, 'intrusion-detection-system')
  if (ids) {
    blockChance += ids.effectiveness ?? 0.35
  }

  const patch = findDefense(nodeData, 'patch-update')
  if (patch) {
    blockChance += patch.effectiveness ?? 0.25
  }

  const securityFactor = (nodeData.securityLevel || 1) * 0.06
  const finalBlockChance = Math.min(0.95, blockChance + securityFactor)

  if (chance(finalBlockChance)) {
    return {
      blocked: true,
      reason: `Defense stack neutralized attack (${Math.round(finalBlockChance * 100)}%)`,
      detection: !!ids,
    }
  }

  return {
    blocked: false,
    reason: 'Defenses failed to contain attack',
    detection: !!ids,
  }
}
