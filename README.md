# CyberRange Simulator

A React-based cyber range simulator demonstrating network attack propagation, defense mechanisms, and incident response procedures.

## 🎯 Overview

The CyberRange Simulator provides hands-on cybersecurity training through realistic attack scenarios, strategic defense deployment, and automated recovery processes. Built with React and React Flow for interactive network visualization.

## 🌐 Network Architecture

### Node Types
- **Internet Gateway** (`⬡`): Network entry point, high DDoS vulnerability
- **Firewall** (`🛡`): Security barrier, strong against most attacks
- **Router** (`⬡`): Traffic routing, moderate vulnerability
- **Server** (`▣`): Application hosting, high malware/DDoS risk
- **Database** (`⬤`): Data storage, critical SQL injection target
- **Workstation** (`⬜`): User endpoints, extreme malware vulnerability

### Node States
- **Secure** (Green): Normal operation
- **Under Attack** (Yellow): Currently being targeted  
- **Compromised** (Red): Successfully infected
- **Protected** (Blue): Defenses active
- **Healing** (Purple): Recovery in progress

## ⚔️ Attack System

### Attack Types & Effectiveness

| Attack | Primary Target | Effectiveness | Lethal Combination |
|--------|----------------|---------------|-------------------|
| **SQL Injection** | Database | 95% | `[LETHAL]` Database |
| **Insider Attack** | Database/Workstation | 85%/90% | `[LETHAL]` Database & Workstation |
| **Malware Spread** | Workstation/Server | 90%/80% | `[LETHAL]` Workstation |
| **DDoS** | Server | 90% | `[LETHAL]` Server |
| **Brute Force** | Database/Workstation | 80%/70% | - |
| **Port Scan** | Gateway/Firewall | 90%/70% | - |

### Attack Propagation
- **Direct Target**: Initial attack on selected node
- **Lateral Spread**: Propagation through network connections
- **Effectiveness Scaling**: Attack strength modified by node vulnerability
- **Healing Disruption**: New attacks interrupt recovery processes

## 🛡️ Defense System

### Defense Mechanisms

| Defense | Effectiveness | Primary Protection |
|---------|---------------|-------------------|
| **Firewall** | 80% | Port blocking (22, 3389, 445) |
| **Antivirus** | 70% | Malware detection + healing bonus |
| **Intrusion Detection** | 35% | Attack pattern recognition |
| **Patch Updates** | 30% | Vulnerability fixes |
| **Network Segmentation** | 65% | Lateral movement blocking |

### Defense Strategy
- **Layered Security**: Multiple defenses provide cumulative protection
- **Node-Specific Protection**: Different defenses for different node types
- **Attack Blocking**: Real-time attack evaluation and neutralization
- **Lateral Prevention**: Network segmentation controls spread

## ⚕️ Healing & Recovery

### Auto-Healing System
- **Automatic Activation**: Starts when nodes are compromised
- **Variable Speed**: Based on security level and antivirus presence
- **Progress Tracking**: Real-time healing progress (0-100%)
- **Healing Disruption**: New attacks can interrupt recovery

### Healing Rates
- **Security Level 1**: 7-19% per tick
- **Security Level 2**: 17-29% per tick  
- **Security Level 3**: 27-39% per tick
- **Security Level 4**: 37-49% per tick
- **Antivirus Bonus**: +8% healing speed

### Manual Recovery
- **Heal Selected**: Instant recovery of individual nodes
- **Heal All**: Mass recovery of all compromised nodes
- **Strategic Response**: Manual intervention during critical incidents

## 🎮 User Interface

### Control Panels
- **Attack Panel**: Launch attacks with configurable parameters
- **Defense Panel**: Deploy defenses and manage nodes
- **Simulation Panel**: Start/pause/reset simulation controls
- **Event Log**: Real-time security event monitoring

### Visualization Features
- **Interactive Network**: Click to select, drag to reposition nodes
- **Progress Bars**: Healing progress visualization
- **Lethal Attack Warnings**: `[LETHAL]` tags for dangerous combinations
- **Color-Coded Status**: Immediate visual threat assessment

## 📊 Analytics & Monitoring

### Real-time Metrics
- Total Attacks Launched
- Attacks Successfully Blocked
- Nodes Currently Infected
- Nodes Under Protection
- Active Security Alerts

### Event Logging
- **Attack Events**: Launch, propagation, completion
- **Defense Events**: Successful blocks, neutralization
- **Healing Events**: Progress updates, completion
- **Lethal Warnings**: High-priority threat notifications

## 🎓 Educational Value

### Learning Objectives
- **Attack Vector Understanding**: Real-world attack patterns
- **Defense Strategy**: Optimal defense placement and configuration
- **Incident Response**: Recovery procedures and timing
- **Risk Assessment**: Identifying critical vulnerabilities
- **Network Security**: Infrastructure protection principles

### Training Scenarios
- **SQL Injection on Database**: Critical data breach simulation
- **Malware Outbreak**: Widespread infection response
- **Insider Threat**: Internal attack detection and containment
- **DDoS Attacks**: Service disruption and recovery
- **Lateral Movement**: Network infiltration prevention

## 🚀 Technical Implementation

### Core Technologies
- **React 18**: Modern UI framework
- **React Flow**: Interactive network visualization
- **Zustand**: State management
- **Vite**: Development build tool

### Simulation Engine
- **Real-time Processing**: 2-second simulation ticks
- **Concurrent Operations**: Attacks and healing run simultaneously
- **State Management**: Persistent node and attack states
- **Event System**: Comprehensive logging and monitoring

---

## 🏆 Project Features

✅ **Complete Attack-Defense-Recovery Cycle**  
✅ **Node-Specific Attack Effectiveness**  
✅ **Lethal Attack Detection & Warning**  
✅ **Automated Healing with Progress Tracking**  
✅ **Strategic Defense Deployment**  
✅ **Real-time Analytics & Monitoring**  
✅ **Interactive Network Visualization**  
✅ **Educational Cybersecurity Training**

*Built for cybersecurity education and incident response training.*
