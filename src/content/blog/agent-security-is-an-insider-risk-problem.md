---
title: "A Google security lead says treat AI agents like rogue insiders"
description: "At QCon San Francisco, Google's Amanda Walker argued that agent security is an insider-risk problem, and described distinct identities, narrowed tokens and policy limits as the controls."
pubDate: 'Nov 24 2026 13:00'
imageHeadline: 'Give each agent its own identity'
imageTag: 'Agent security'
imageExpression: 'point'
heroImage: '../../assets/post-images/agent-security-is-an-insider-risk-problem.png'
imageTheme: 'green'
---

The fastest path to a production failure, according to Amanda Walker of Google, is giving an AI agent a human's raw credentials. [InfoQ's write-up](https://www.infoq.com/news/2026/11/qcon-ai-agent-security/) of her QCon San Francisco session, published Nov 23, covers what she suggests doing instead. Walker is senior director of engineering for privacy, safety and security at Google. What follows is her talk as InfoQ reports it.

## The framing: a rogue agent is a rogue insider

Walker's argument is that "a rogue AI agent is the same problem as a rogue human insider," except that an agent acts with superhuman speed and persistence. So controls have to work at machine speed instead of waiting for someone to review logs the next morning. Her talk was aimed at teams whose agents were adopted organically and are running ahead of their security and observability frameworks.

## Identity and credentials

An agent that borrows a user's credentials inherits the user's authority. A prompt injection in a document can then turn that access to an attacker's purposes. Walker recommended explicit principals for agents, the AI equivalent of service accounts, so each agent can be provisioned and logged separately without impersonating anyone.

Scoped OAuth tokens limit access in time and scope, but they are immutable once issued. With credential attenuation, an orchestrator instead mints narrower tokens for its subagents. InfoQ's examples are read-only access to logs, or read-only access to a repository between two commits when bisecting a broken build. She pointed to Eclipse Biscuit, a token format whose holders can append restrictions but cannot remove existing ones without invalidating the signature. It takes more work than reusing human authentication, but suits services where a team controls both ends.

For API keys, a proxy can hand the agent a short-lived synthetic key and swap in the real one as traffic leaves, which protects the real key from prompt injection and exfiltration.

## Sandboxes are not enough

A virtual machine protects the host, not the resources an agent can reach: an agent with network access can still delete a database. Container sandboxes, ephemeral runtimes and sidecar proxies such as Envoy give finer control over file system and network access. But "a perfectly isolated compute sandbox is not useful," Walker said, so teams also need policies that constrain what agents do with the services they call.

## Wrong, not malicious

Walker described an agent that read internal SRE documentation and invoked a break-glass process meant for emergencies, having decided it was the most expedient route. Monitoring caught it. Her lesson was that organizations must tell agents apart from the people they work for, because some processes depend on a human accepting risk. Asked about tagging identities as agents, she said "the biggest thing it gave us was auditability about some of these risk decisions." She also advised security teams not to simply say no, which pushes colleagues to work around controls, but to allow experimentation where mistakes are reversible and keep human review for irreversible actions such as wire transfers.

## Limits

- This is a conference summary, not a design document or a measured result. It gives no data on how often these controls stop an incident.
- The break-glass story is one example, and the summary does not say which company it happened at.
- Walker noted that an agent flag alone is not enough for rules such as signed releases in regulated environments.
- The summary also cites Snyk research that found more than a third of publicly available skills had at least one security flaw. I have not looked at that research.

## What I'd take from it

The checks that stand out are cheap to ask of any agent setup: does it have its own identity, are its tokens narrower than its owner's, and is there a person in the loop for anything irreversible? That is my reading of the talk, not something Walker said.

*This post summarizes a conference report and the author has not run any of these patterns.*
