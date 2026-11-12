---
title: "Confluent cut its OpenSearch hot tier from 168 nodes to 90"
description: "AWS describes how Confluent swapped instance types at constant node count, measured the headroom, then removed nodes until JVM heap became the limit."
pubDate: 'Nov 11 2026 13:00'
imageHeadline: '168 OpenSearch nodes became 90'
imageDiagram: '{"nodes": [{"id": "a", "label": "r6gd", "col": 0, "row": 1, "sub": "168 nodes", "style": "muted", "src": ["The hot tier ran on r6gd, a previous-generation Graviton2 instance", "ended up with 90 nodes instead of 168"]}, {"id": "b", "label": "oi2", "col": 1, "row": 1, "sub": "same count, one-third CPU", "src": "At equal node count oi2 ran at roughly one-third the CPU of r6gd"}, {"id": "c", "label": "oi2", "col": 2, "row": 1, "sub": "90 nodes, 1.9x load each", "src": "Each oi2 node ended up carrying about 1.9x the load of an r6gd node (168 divided by 90)"}], "edges": [{"from": "a", "to": "b", "label": "swap type", "src": "Type swap at constant node count"}, {"from": "b", "to": "c", "label": "rightsize", "style": "hot", "src": "Iterative rightsizing. Nodes were removed in steps"}], "note": "Figures as reported in the AWS Big Data Blog post"}'
imageTag: 'OpenSearch sizing'
heroImage: '../../assets/post-images/confluent-opensearch-fewer-nodes-measure-first.png'
imageTheme: 'red'
imageExpression: 'shocked'
---

Confluent's internal logging system runs on Amazon OpenSearch Service and ingests hundreds of terabytes of logs per day. A [post on the AWS Big Data Blog](https://aws.amazon.com/blogs/big-data/46-fewer-nodes-2x-faster-indexing-confluent-on-amazon-opensearch-service/), published November 10, 2026, describes how the team moved its hot tier to a new instance family and ended up with 90 nodes instead of 168, even though each new node costs more.

## The question they asked

The team did not ask whether it could run on cheaper hardware. It asked how much more ingest each node could absorb and how much headroom that would free. The post's own summary is that the lower cost came from efficiency, not from a lower instance price.

## What changed underneath

The hot tier ran on r6gd, a previous-generation Graviton2 instance with local NVMe added as a bolt-on. It moved to oi2, an OpenSearch Optimized Instance type where local NVMe is the primary storage tier with no separate EBS volume, and data is copied synchronously to Amazon S3 for durability.

The other difference is replication. Standard OpenSearch uses logical replication, where every copy indexes each document independently. Optimized Instances use physical (segment) replication: data is indexed only on the primary, and replicas get copied segments. That frees replica compute from redundant indexing. The post notes a side effect: with replicas, the reported indexing rate can look lower than the real one, for example showing 1,000 when the actual rate is 2,000, because indexing happens only on primary shards.

## The two phases

1. **Type swap at constant node count.** An in-place blue/green re-provision with the same number of nodes. At equal node count oi2 ran at roughly one-third the CPU of r6gd for the same ingest, about 2.7x the headroom per node.
2. **Iterative rightsizing.** Nodes were removed in steps, pausing at each step to confirm cluster health, until a guardrail became binding. That guardrail was JVM heap, not CPU. oi2 has the same heap per node as r6gd, so packing the same shards onto fewer nodes raised average heap on every domain.

Each oi2 node ended up carrying about 1.9x the load of an r6gd node (168 divided by 90).

## The numbers

The figures compare a 7-day baseline on r6gd with a 24-hour window on oi2, at the same ingest.

| Domain | Nodes | Avg CPU | Indexing latency | Write queue (ops) |
|---|---|---|---|---|
| A (high-volume) | 30 to 12 | 49% to 43% | 0.19 to 0.08 ms | 17.6 to 0.2 |
| B (streaming logs) | 36 to 18 | 60% to 40% | 0.18 to 0.08 ms | 20.6 to 0.3 |
| C (high-volume) | 39 to 27 | 58% to 39% | 0.19 to 0.09 ms | 37.9 to 0.2 |
| D (low-volume) | 63 to 33 | 43% to 56% | 0.18 to 0.10 ms | 8.4 to 1.0 |
| Fleet | 168 to 90 | n/a | about halved | under 1 everywhere |

The post reports zero write or primary-write rejections in the final state and healthy clusters throughout. Estimated hot-tier cost is about 18% lower at on-demand pricing, and roughly 47 to 51% below the original on-demand baseline with one-year reserved instances.

## What the post doesn't say

- **Domain D is the outlier.** It was cut hardest relative to its load. Its CPU rose and it is the only domain whose write queue is not near zero. The authors say to watch it through peak traffic before calling it settled.
- Cost figures are approximate, list-derived percentages. Reserved-instance figures are estimates pending a quoted rate. Storage (UltraWarm and snapshots) and dedicated-master tiers are excluded.
- The team did not benchmark R8gd. It evaluated only the oi2 family.
- The before and after windows differ in length (7 days against 24 hours).
- This is an AWS-published customer story.

What I'd take from it: swap the instance type first, at the same node count, and read the headroom from production before removing capacity. Then let the binding resource, which here was heap, set the floor.

*This post summarizes the linked AWS article. I haven't run this migration.*
