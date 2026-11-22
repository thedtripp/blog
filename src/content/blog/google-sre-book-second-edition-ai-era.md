---
title: "Google rewrote the SRE book. SLOs now measure users, not uptime."
description: "Ten years after the first edition, Google's second SRE book swaps static dashboards and scheduled game days for burn-rate alerts, tracing and continuous resilience checks, as InfoQ summarizes."
pubDate: 'Nov 18 2026 13:00'
imageHeadline: 'SRE book rewritten after 10 years'
imageTag: 'SRE'
imageExpression: 'thinking'
heroImage: '../../assets/post-images/google-sre-book-second-edition-ai-era.png'
imageTheme: 'red'
---

Google has published a completely rewritten second edition of *Site Reliability Engineering: How Google Runs Production Systems*, ten years after the first. InfoQ's [write-up](https://www.infoq.com/news/2026/11/google-sre-book-ai-era/) of Google's announcement, by SRE program manager Betsy Beyer and software engineer David Huska, was published on Nov 17, 2026. This post covers what changed, as described there.

## The stated problem

The authors say the central problem is no longer adopting cloud infrastructure. It is keeping systems reliable as they become more distributed, interdependent and continuously changing. In their words: "Modern production environments operate under constant change. System boundaries are more complex, dependencies are deep, and failure modes are more complex and damaging than ever before."

## What changed, area by area

- **SLOs and error budgets.** Google says teams once relied on basic availability metrics and manually applied error-budget policies. The revised guidance describes user-centred, multi-tiered SLOs, dynamic burn-rate alerting and automated policy enforcement. The shift is from infrastructure uptime toward measures of how failures affect users.
- **Observability.** The first edition's static dashboards, basic logs and manual alert triage give way, in Google's account, to OpenTelemetry, distributed tracing and automated anomaly correlation. The stated aim is to shorten the time between an alert and a credible explanation of what failed, not to collect more telemetry.
- **Automation.** Custom scripts for isolated tasks give way to declarative infrastructure as code, internal developer platforms and self-healing systems.
- **Reliability testing.** Scheduled game days and synthetic load tests give way to continuous resilience checks, automated pipeline testing and live production canary verification. Resilience becomes part of the delivery pipeline.
- **Capacity.** Manual provisioning and static forecasting give way to dynamic auto-scaling, FinOps alignment and optimization for GPU and TPU clusters.
- **Organization.** The book moves beyond dedicated SRE teams per application toward hybrid models, platform-engineering integration and reliability champions embedded in product teams.

## Where AI shows up

AI appears in two roles. First, SRE as the discipline for operating AI infrastructure: large GPU and TPU clusters, network topologies, non-deterministic model outputs, latency behavior and training and data pipelines, which InfoQ notes are different problems from a stateless web service.

Second, AI as a tool for reliability engineers: incident triage, postmortem writing, natural-language queries over telemetry and predictive models that flag resource bottlenecks before an outage. InfoQ observes that the examples mostly cast AI as gathering and organizing evidence for engineers, not replacing their judgment.

## What I'd take from it

The common thread is a move from fixed, manual practices to continuous, automated ones, with the user's experience as the yardstick. For a team that already runs SLOs, InfoQ's view is that the value lies less in new concepts than in seeing how familiar ones were adapted for platforms, distributed systems and AI-heavy infrastructure.

## Limits

- This is InfoQ's summary of Google's announcement. The book itself is not summarized here, and no chapter-level detail is covered.
- The changes are Google's own account of how practice evolved, not measured results. The source gives no numbers on outcomes.
- The announcement places AI in a supporting role. It does not claim AI can replace operational judgment.
- The second edition is available in print through Google Books and digitally from O'Reilly.

*This post summarizes InfoQ's reporting on Google's announcement. I have not read the book or run any of these practices.*
