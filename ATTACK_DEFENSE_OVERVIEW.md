# CyberRange Simulator - Attack & Defense Overview

## 🎯 Project Overview
A React-based cyber range simulator that demonstrates network attack propagation and defense mechanisms in real-time.

## 🚀 Core Features
- **Network Visualization**: Interactive canvas showing network topology
- **Attack Simulation**: Real-time attack propagation across nodes
- **Defense Deployment**: Multiple defense mechanisms to protect nodes
- **Event Logging**: Real-time monitoring of all activities
- **Analytics Dashboard**: Metrics and visualization of security events

## 🌐 Network Architecture

### Node Types
- **Gateway** (`⬡`): Internet entry point
- **Firewall** (`🛡`): Network security barrier
- **Router** (`⬡`): Traffic routing device
- **Server** (`▣`): Application hosting
- **Database** (`⬤`): Data storage
- **Workstation** (`⬜`): User endpoints

### Node States
- **Secure** (Green): Normal operation
- **Under Attack** (Yellow): Currently being targeted
- **Compromised** (Red): Successfully infected
- **Protected** (Blue): Defenses active

## ⚔️ Attack System

### Attack Types
1. **Malware**: Software-based infection
2. **Phishing**: User credential theft
3. **DDoS**: Service disruption attacks
4. **SQL Injection**: Database exploitation
5. **Man-in-the-Middle**: Traffic interception

### Attack Parameters
- **Origin Node**: Attack source
- **Target Node**: Attack destination
- **Strength (1-5)**: Attack intensity
- **Spread Rate (0.1-1.0)**: Propagation speed
- **Port**: Network service target

### Attack Propagation Logic
```
Attack Launch → Target Assessment → Defense Evaluation → 
Success/Failure → Spread to Connected Nodes → Log Event
```

## 🛡️ Defense System

### Defense Mechanisms
1. **Firewall** (Effectiveness: 80%)
   - Blocks unauthorized ports [22, 3389, 445]
   - Network traffic filtering

2. **Antivirus** (Effectiveness: 70%)
   - Malware detection and removal
   - File system protection

3. **Intrusion Detection** (Effectiveness: 55%)
   - Anomaly detection
   - Attack pattern recognition

4. **Patch Update** (Effectiveness: 45%)
   - Vulnerability fixes
   - System hardening

5. **Network Segmentation** (Effectiveness: 50%)
   - Network isolation
   - Containment strategies

### Defense Deployment Rules
- One defense type per node
- Defenses modify node status to "protected"
- Multiple defenses can be stacked on different nodes
- Defenses affect attack propagation through connections

## 📊 Simulation Flow

### Attack Lifecycle
1. **Launch Phase**: User selects attack parameters
2. **Propagation Phase**: Attack spreads through network connections
3. **Defense Phase**: Each node's defenses evaluate and potentially block attacks
4. **Resolution Phase**: Attack succeeds, fails, or gets contained

### Real-time Updates
- **Event Logs**: Timestamped security events
- **Node Status**: Visual indicators of compromise
- **Analytics**: Charts showing attack trends and defense effectiveness
- **Metrics**: Total attacks, blocked attacks, infected nodes, protected nodes

## 🎮 User Interface

### Control Panels
- **Attack Panel**: Configure and launch attacks
- **Defense Panel**: Select nodes and deploy defenses
- **Simulation Panel**: Start/pause/reset simulation, manage nodes

### Visualization Features
- **Interactive Canvas**: Click to select nodes, drag to reposition
- **Real-time Updates**: Pulsing edges during attacks, color-coded node states
- **Zoom & Pan**: Navigate large network topologies

## 🔧 Technical Implementation

### Core Components
- **useSimulation Hook**: Central state management
- **Network Canvas**: SVG-based network visualization
- **Analytics Engine**: Real-time metrics calculation
- **Event System**: Comprehensive logging and filtering

### State Management
- **Nodes**: Network devices with properties and defenses
- **Edges**: Network connections between nodes
- **Active Attacks**: Currently ongoing attack instances
- **Event Logs**: Historical security events
- **Metrics**: Performance and security statistics

## 📈 Key Metrics Tracked
- Total Attacks Launched
- Attacks Successfully Blocked
- Nodes Currently Infected
- Nodes Under Protection
- Active Security Alerts

## 🎯 Learning Outcomes
This simulator demonstrates:
- Network attack propagation patterns
- Defense mechanism effectiveness
- Real-time cybersecurity monitoring
- Strategic defense placement
- Attack impact analysis

---

*Note: This is a simplified educational simulator designed for demonstration purposes, not a production security tool.*
