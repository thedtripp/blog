---
title: "DoorDash split dispatch into a stateful coordinator and stateless workers for 10x throughput"
description: "DoorDash replaced a monolithic dispatch optimizer with a coordinator that holds state and workers that do the math. It reports 10x throughput and more than 99.99% availability at peak."
pubDate: 'Nov 26 2026 13:00'
imageHeadline: '10x dispatch throughput at peak'
imageTag: 'DoorDash'
imageExpression: 'thinking'
---

[InfoQ reports](https://www.infoq.com/news/2026/11/doordash-dispatch-redesign/) (Nov 25) that DoorDash rebuilt its real-time dispatch platform, replacing a monolithic optimization engine with a distributed design that separates coordination from computation. DoorDash reports 10x higher throughput and more than 99.99% availability at peak. The interesting part is why adding machines was not the fix.

## The problem

The old engine tightly coupled business logic, logistics state management, and heavy routing algorithms. As volume grew, the optimization work got harder to finish in the time available for a dispatch decision. The underlying algorithms had roughly quadratic time complexity, and at peak, demand approached four times the system's processing capacity. The engine fell back on heuristics and sometimes assigned orders using incomplete information.

DoorDash's engineers put it this way, as quoted by InfoQ: "The fatal bottleneck wasn't just raw machine capacity; it was the speed of reality."

## The design

Instead of scaling the monolith horizontally, DoorDash split execution into two tiers that scale independently:

- A **stateful coordinator** manages dispatch lifecycles, keeps the global logistics state, and validates business rules.
- **Stateless compute workers** do the mathematical optimization, vehicle-routing heuristics, and model inference.

The coordinator shards the payload and sends each worker only a localized slice of the data, so it does not broadcast the whole global state to every worker. To tame the quadratic cost, it also stops solving one global problem. It partitions the data into geographic clusters and delivery trajectories, workers solve the smaller problems in parallel, and a reconciliation layer combines the results.

Latency-sensitive model inference runs locally inside the workers, which avoids remote procedure call overhead. More complex evaluations go to isolated remote model-serving clusters, away from the coordinator's state-management path.

## How they rolled it out

Before the new platform made live decisions, DoorDash ran shadow tests. Production requests were duplicated; the legacy engine still determined assignments while the new platform's outputs were logged for comparison, covering matching quality, delivery times, and behavior under load. After establishing parity, they used controlled switchback experiments and fallback mechanisms.

## Reported results

DoorDash reports a tenfold increase in dispatch throughput, with more than 99.96% of runs completing within 20 seconds. On Super Bowl Sunday the platform stayed above 99.99% availability despite a 10% week-over-week increase in peak volume.

InfoQ also reports that DoorDash uses multi-agent reinforcement learning to adjust dispatch objective weights from local feedback such as merchant congestion and courier utilization, evaluated in production switchback experiments.

## What the report doesn't say

- The numbers are DoorDash's own, relayed by InfoQ. There is no independent measurement.
- The 10x figure has no stated baseline hardware or workload, and the report does not say whether the cost of running the system changed.
- The Super Bowl figure is for a 10% week-over-week increase in peak volume. The report doesn't say how the new platform behaves at the roughly 4x demand-to-capacity gap it describes for the old engine.
- The report doesn't describe the reconciliation layer's trade-offs, such as whether combining partitioned solutions gives assignments as good as one global solve.

## What I'd take from it

When the cost of a problem grows faster than the cluster you can throw at it, the lever is the problem's shape. Splitting state from compute and shrinking each solve is what DoorDash describes doing. That is my reading of the report, not a claim from DoorDash.

*This post summarizes InfoQ's article and adds my own reading. I haven't run or tested this system.*
