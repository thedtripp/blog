---
title: 'Agent memory is a write path into your prompts'
description: "AWS's guidance on validating writes to Amazon Bedrock AgentCore memory, and the part of it that applies to any agent with memory."
pubDate: 'Nov 09 2026 09:00'
imageHeadline: 'Agent memory is a write path'
imageDiagram: '{"nodes": [{"id": "w", "label": "Agent write", "col": 0, "row": 1, "src": "A function that runs before each write and scores it"}, {"id": "sc", "label": "Score the write", "col": 1, "row": 1, "sub": "four signals", "src": ["A function that runs before each write and scores it", "Four signals feed the score"]}, {"id": "al", "label": "Allow", "col": 2, "row": 0, "sub": "below 35", "src": "Below 35: allow."}, {"id": "qu", "label": "Quarantine", "col": 2, "row": 1, "sub": "35 to 60", "style": "muted", "src": "35 to 60: quarantine. The write goes to an isolated namespace and the agent keeps running"}, {"id": "de", "label": "Deny", "col": 2, "row": 2, "sub": "above 60, alert", "src": "Above 60: deny, and send an alert"}], "edges": [{"from": "w", "to": "sc", "src": "A function that runs before each write and scores it"}, {"from": "sc", "to": "al", "src": "Below 35: allow."}, {"from": "sc", "to": "qu", "style": "hot", "src": "35 to 60: quarantine. The write goes to an isolated namespace and the agent keeps running"}, {"from": "sc", "to": "de", "src": "Above 60: deny, and send an alert"}], "note": "Thresholds are AWS’s own, as described in its post"}'
imageTag: 'AI security'
heroImage: '../../assets/post-images/agent-memory-is-a-write-path.png'
imageTheme: 'purple'
imageExpression: 'scared'
---

AWS published guidance today on defending Amazon Bedrock AgentCore memory against poisoning. [The post](https://aws.amazon.com/blogs/security/help-defend-against-memory-poisoning-in-amazon-bedrock-agentcore-with-multi-layer-write-validation/) is worth reading, and here is what I took from it.

## The problem

AWS describes memory poisoning as a form of indirect prompt injection. An ordinary prompt injection affects one conversation. A poisoned memory, per the post, "can persist across sessions and, in shared namespaces, influence multiple agents and users." Their example: an attacker writes an instruction to memory in one session, and days later a different user's session retrieves it and acts on it.

Memory content is retrieved automatically and fed into future conversations. So a write to memory is a write into the prompts of every session that retrieves it.

## What AWS built

A function that runs before each write and scores it, then returns one of three decisions. Four signals feed the score, with these weights:

| Signal | Weight | What it checks |
|---|---|---|
| Semantic drift | 40% | Compares the write against the session context using embeddings. Meant to catch attacks that use non-English or obfuscated phrasing. |
| Instruction pattern | 25% | A regex filter for known injection markers, aimed at obvious English-language injections. |
| Namespace boundary | 25% | A deterministic check of which memory namespaces the current session may write to. |
| Write-rate anomaly | 10% | A per-session write counter compared against a learned baseline, to catch automated bursts. |

The decision tiers:

- **Below 35:** allow.
- **35 to 60:** quarantine. The write goes to an isolated namespace and the agent keeps running.
- **Above 60:** deny, and send an alert.

## The part I'd copy anywhere

The quarantine tier. A system that only allows or denies has to be right about every write. A middle bucket lets the agent keep working while a suspicious write waits for review.

The second design choice is the failure policy. If the validation function itself is unavailable, you choose between allowing writes (favors availability) and blocking all of them. That is the same fail-open versus fail-closed decision you make for any dependency in a request path, and it is worth deciding on purpose.

## Limits

AWS hedges its own claims. It says the drift signal can help flag divergent content, and that the controls help detect attacks, not that they prevent them. The regex layer is described as catching obvious English injections. I haven't tested any of this, so this is a read of the post and not a review of the product.

## If your agents have memory

Treat the memory store like any database write path. Validate at the boundary, keep track of where each entry came from, and make writes reversible. The question I'd ask of any system is what happens to a write it isn't sure about.
