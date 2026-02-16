# AI in Advertising: AdCP vs ARTF Extended Pre-Read
## Comparing advanced AI solutions transforming advertising strategies


1
adform

# Introduction and Context


adform

# Industry Shift to AI-Native Advertising

## AI-Driven Advertising Evolution
Advertising is shifting from human rules to autonomous AI agents for improved efficiency and personalization.

* **Ad Context Protocol (AdCP)**
  AdCP enables seamless agent-to-agent communication across advertising workflows from planning to measurement.

* **Agentic RTB Framework (ARTF)**
  ARTF introduces containerized agents in real-time bidding to securely modify bid streams and improve transparency.
  More restricted scope.

## Strategic Implications
Understanding and adopting these protocols is essential for competitiveness in the AI-native advertising era.


adform

# Core Concepts


adform

# Agent-to-Agent Communication vs Agent Containers

## Scope and Focus Differences
AdCP spans the full advertising lifecycle promoting interoperability, while ARTF focuses on auction-time decisioning with strict platform control.

### Agent-to-Agent Communication (AdCP)
AdCP enables direct communication between AI agents across platforms, standardizing tasks like audience discovery and campaign optimization using MCP.

### Agent Containers in RTB (ARTF)
ARTF embeds containerized agents in real-time bidding infrastructure for low latency tasks like bid adjustments and fraud detection.


5
adform

# Core Technologies: MCP vs OpenRTB Patch + gRPC

* MCP focuses on flexibility and interoperability;
* OpenRTB Patch and gRPC emphasize speed, security, and control in auctions.

### Model Context Protocol (MCP)
MCP uses JSON-RPC for structured, context-rich AI agent communication, supporting discovery and negotiation across platforms.

### OpenRTB Patch Technology
OpenRTB Patch enables atomic, intent-driven mutations in bid requests allowing secure and efficient auction orchestration.

### gRPC High-Performance Calls
gRPC delivers sub-millisecond remote procedure calls for container orchestration ensuring low-latency communication in RTB systems.


Sample Footer Text
1/28/2026
6
adform

# Architectures and Workflows


adform

# Architecture Overview

Both architectures aim for modularity and scalability, focusing on interoperability for AdCP and secure execution for ARTF.

## AdCP Architecture

AdCP uses distributed AI agents connected by MCP interfaces for cross-platform collaboration without custom integrations.

### Agent-to-Agent Communication

```mermaid
graph LR
    AP1[Advertising Platform] --- MCP1((MCP)) --- AI1((AI Agent))
    AI1 --- MCP2((MCP)) --- AP2[Advertising Platform]
    AP2 --- MCP3((MCP)) --- AI2((AI Agent))
    AI2 --- MCP4((MCP)) --- AI3((AI Agent))
    AI3 --- MCP5((MCP)) --- AP1
```

## ARTF Architecture

ARTF embeds containerized agents within SSP or DSP, interacting with orchestrators using gRPC and OpenRTB Patch.

```mermaid
graph LR
    Orchestrator[Orchestrator<br/>Controls agent<br/>containers,<br/>manages execution] --> Containers
    subgraph Containers [ ]
        C1[Containers]
        C2[Containers]
        C3[Host agent<br/>workloads,<br/>enable bidstrem<br/>mutation]
    end
    Containers -- "OpenRTB<br/>Patch" --> Bidstream
```


8
adform

# Workflow Visualization

**AdCP Agent Discovery and Negotiation**
Advertiser agents identify publisher agents and negotiate campaign terms using MCP for activation.

**Continuous Execution and Optimization**
Agents exchange performance signals in real time to optimize campaigns dynamically.

---

**ARTF Auction and Mutation Handling**
Orchestrator invokes container to process bids, propose atomic mutations, ensuring auditability and low latency.


9
adform

<table>
  <thead>
    <tr>
        <th>Pros</th>
        <th>Cons</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>* **AdCP Interoperability and Innovation**<br/>AdCP enables broad interoperability and AI-native workflows, fostering innovation with an open governance model.</td>
        <td>* **AdCP Adoption Challenges**<br/>AdCP adoption is nascent and depends on widespread industry participation for success, driven by few private companies.</td>
    </tr>
    <tr>
        <td>* **ARTF Security and Modularity**<br/>ARTF offers strong security, privacy controls, and modular container-based orchestration ideal for RTB optimizations.</td>
        <td>* **ARTF Scope and Complexity**<br/>ARTF focuses on RTB with operational complexity in container management as a limitation.</td>
    </tr>
  </tbody>
</table>


Sample Footer Text
1/28/2026
10
adform

# What does it mean for Adform?


adform

Strategic Implications for Adform


# AdCP Adoption

### ◎ Cross-Platform Interoperability
Supporting AdCP allows Adform to act as an open endpoint, enabling seamless agentic workflows across platforms, while keeping control of the infrastructure. Probably the easiest path, requiring a 'translator' to adapt our API decisioning system to the MCP 'language'

## Agent-to-Agent Communication

```mermaid
graph LR
    subgraph Network [Agent Network]
        AP[Advertising Platform]
        AA1[Al Agent]
        AA2[Al Agent]
        AA3[Al Agent]
    end

    AP --- AA1
    AA1 --- LT[Language Translator]
    LT --- AA3
    AA3 --- AA2
    AA2 --- AP
    
    AA1 -- MCP --- LT
    LT -- MCP --- AA3
    AA3 -- MCP --- AA2
    AA2 -- MCP --- AP
    AP -- MCP --- AA1

    LT --> DSP[Adform DSP]

    style AP fill:#e1f5fe,stroke:#01579b
    style LT fill:#e1f5fe,stroke:#01579b
    style DSP fill:#e1f5fe,stroke:#01579b
    style AA1 fill:none,stroke:none
    style AA2 fill:none,stroke:none
    style AA3 fill:none,stroke:none
```


12
adform

# Strategic Implications for Adform

## ARTF Adoption

### ◎ Enhanced In-Auction Decisioning
Implementing ARTF with container orchestration and OpenRTB Patch improves secure, real-time auction optimizations.
More complex as affects directly our bidding algos. Could be part of Adform IQ.

#### powered by Adform IQ

```mermaid
graph LR
    subgraph AdformIQ [powered by Adform IQ]
        Orchestrator[Orchestrator]
        subgraph HostAgent [Host agent workloads, enable bidstream mutation]
            C1[Containers]
            C2[Containers]
        end
    end
    
    Orchestrator -- "Controls agent containers, manages execution" --> HostAgent
    HostAgent -- "OpenRTB Patch" --> Bidstream[Bidstream]

    style AdformIQ fill:none,stroke:#333,stroke-width:2px
    style Orchestrator fill:#fff,stroke:#333
    style HostAgent fill:#fff,stroke:#333
    style C1 fill:#fff,stroke:#333
    style C2 fill:#fff,stroke:#333
```


13
adform