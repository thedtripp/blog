---
title: "Google's agent sandbox keeps credentials outside the microVM"
description: "Google's Agent Compute Engine runs AI agents in microVMs and injects secrets through an external gateway. It has no price and no boot time yet, and previews in the coming months."
pubDate: 'Nov 22 2026 13:00'
imageHeadline: 'No credentials inside the agent sandbox'
imageTag: 'Agent sandbox'
imageExpression: 'thinking'
---

[Google announced Agent Compute Engine](https://www.infoq.com/news/2026/11/google-agent-compute-engine/) (reported Nov 22), a managed service that runs AI agents in isolated microVMs and can suspend and resume them with checkpointing. The design keeps credentials, API keys and OAuth refresh tokens outside the sandbox. An external Agent Gateway authenticates requests and injects the secrets that are needed.

## The design

Google's stated requirements at global scale are three: keep sandboxes free of exploitable credentials even when agents make mistakes, minimize the cost and latency of resuming idle agents, and preserve persistent workspaces across sessions and operating system updates. To get there, the infrastructure team says the service uses copy-on-write memory sharing to run multiple agents on a single operating system template, and pauses idle microVMs through fast checkpoint and restore.

The harness and the sandbox are separate. In Google's words, the orchestration harness (the brain) runs completely outside the execution sandbox (the hands), so untrusted guest environments only execute explicit commands and stream output back. That boundary gives a deterministic audit trail linking every harness-initiated tool call to expected compute activity in the sandbox.

The architecture targets four workload types: interactive agents that execute code, browse and act; persistent Linux workspaces for autonomous software engineering; large parallel environments for model evaluation and reinforcement learning; and lightweight sandboxed execution for dynamic logic in Google services. Google says it uses the platform internally for Gemini, Gemini for Business, Antigravity and model evaluation.

## Governance pieces

Google also expanded its agent governance stack: Agent Gateway for traffic control and policy, Agent Registry for approved agents and tools, SPIFFE-based Agent Identity for authentication and auditing, and OpenTelemetry-compatible observability for model calls and tool invocations.

## What isn't there yet

- Agent Compute Engine is not yet available, pricing has not been announced, and Google is targeting a preview in the coming months.
- Harel Asaf, an AI specialist at Elementor, notes that the deep dive gives no boot time, price or density figure for Agent Compute Engine itself. Those numbers in the announcement belong to Agent Substrate, a separate open-source, Kubernetes-native runtime that Google also offers.
- Agent Compute Engine itself is limited to Google Cloud, while Agent Substrate is portable across Kubernetes environments.
- Google is not alone: AWS and Azure offer managed, isolated execution for agents through Bedrock AgentCore and Foundry Agent Service. What the report singles out as different about Google's approach is credentials staying outside the sandbox and arriving through an external gateway.

## Takeaway

My reading of the report: the part worth borrowing is the pattern, not the product. If an agent can't see a credential, a mistake or a prompt injection inside the sandbox has less to steal. That is a design choice you can ask of any agent runtime today. Whether this one performs and prices well is unknown until the preview.

*This post summarizes the InfoQ report and the Google material it quotes. I haven't run any of it.*
