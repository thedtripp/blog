---
title: "Uber checks whether an agent's action is appropriate, not only allowed"
description: "InfoQ summarizes Uber's three-layer framework for securing AI agents, and the commenters it quotes ask what it costs to run."
pubDate: 'Nov 16 2026 13:00'
imageHeadline: 'Uber guards agents in 3 layers'
imageTag: 'AI Security'
imageExpression: 'neutral'
---

Identity and API permissions answer whether an agent may touch a resource. They don't answer whether this particular action makes sense for this request. That gap is the starting point of a framework from Uber Engineering, summarized by Sergio De Simone in an [InfoQ news article](https://www.infoq.com/news/2026/11/uber-secure-ai-framework/) dated Nov 15, 2026. I read the InfoQ summary in full, not Uber's original article, so everything below is InfoQ's account.

## The problem

According to InfoQ, traditional identity and authorization systems can say whether a user or service has permission to access a resource. They can't say whether an agent's proposed action is appropriate in context. The risks it lists include prompt injection, tool and memory poisoning, goal hijacking, behavioral drift and hallucination-driven actions. Uber's framework judges an action against the user's request, the agent's intended purpose, its permissions and the context of the interaction.

## Three layers across the agent lifecycle

**Provisioning.** Agents are registered in the Uber AI Registry, which records identity, ownership, persona, permitted intents, constraints, dependencies and risk classification. InfoQ says this is automated with Argus, which analyzes the agent's source code, prompts, configurations, dependencies, exposed endpoints and tool-invocation paths for security weaknesses. The same approach applies to MCP servers and tools the agents use.

**Runtime.** The usual model of policy administration, decision and enforcement is extended with what InfoQ calls behavioral authorization, which evaluates whether an action is appropriate in context. It has three parts: the AI Registry, which holds policies, personas, intents and constraints; AI Guards, which check interactions and proposed actions against those policies; and Agent Guard runtime hooks, which call AI Guard at critical checkpoints and apply its verdict before an action proceeds.

**After deployment.** Continuous Assurance relies on observability, auditing, explainability and replay. InfoQ describes a unified execution trace that connects agent actions, tool calls and security decisions, plus recorded interactions that can be replayed when policies change, to see how the new rules would have behaved.

## What Uber says was hard

InfoQ lists the production challenges: policies that are neither so strict they produce false positives nor so loose they miss problems, runtime latency, developer friction during setup, and moving from generic controls to agent-specific policies, which Uber says "made enforcement more contextual and precise".

## What commenters on InfoQ's piece question

InfoQ quotes two LinkedIn commenters. Tristan G., a UN senior IT officer, says per-agent personas, intents and constraints add the most value but cost the most, because "the effort scales with the number of workflows". He also notes that the strongest control, by Uber's own account, was restricting agents to explicit constraints, which he calls least privilege rather than a new idea. His open question is how this works for vendor or SaaS agents where you can't insert your own enforcement hooks. AI architect Pratik Dhanave says explicit intents and constraints per agent beat generic thresholds, and that the cost is flexibility, which Uber says is worth paying.

## What the summary doesn't say

- It gives no numbers: no latency overhead, false-positive rate or incident counts.
- Everything is Uber's own account of its own system, relayed by InfoQ.
- InfoQ says the framework is still evolving and points readers to Uber's original article for more detail.

What I'd take from it: per the commenters InfoQ quotes, the per-agent work is both where the value is and where the cost is.

*This post summarizes the linked InfoQ article. The author hasn't built or run this framework.*
