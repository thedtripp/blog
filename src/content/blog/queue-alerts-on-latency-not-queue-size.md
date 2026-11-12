---
title: "Gearset alerts on queue latency, not queue size"
description: 'At QCon London, Gearset engineers described tracing messages through SQS queues with OpenTelemetry and replacing queue-size alerts with latency SLOs.'
pubDate: 'Nov 12 2026 13:00'
imageHeadline: 'Alert on queue latency, not size'
imageTag: 'Observability'
imageExpression: 'thinking'
---

Oli Lane and Julian Wreford of Gearset describe how they moved from guessing at queue problems to pointing at the exact bottleneck, in an [InfoQ talk with transcript](https://www.infoq.com/presentations/opentelemetry-queue-observability/) from QCon London 2026. The starting point was a customer asking why a backup job ran about an hour late. Dashboards, metrics, logs and alerts gave plausible theories, but the team never learned why that job was late.

## Why metrics weren't enough

Gearset introduced queues to smooth load and decouple services. Their scheduler ran customer backups, and because almost everyone picks midnight, it had been hitting the application with hundreds of heavy requests at once. The standard queue metrics (size, enqueue rate, dequeue rate, in-flight count) showed roughly where to look. Logs held the detail but took manual work, and the speakers say they sometimes burned hours chasing a phantom spike. Metrics gave them the forest and logs the trees.

## Tracing across the queue

OpenTelemetry traces carry a hierarchy of spans, and HTTP calls propagate it automatically. Their queue libraries didn't speak OpenTelemetry, so they wrote a small middleware layer for producers and consumers. It attaches the `traceparent` (version, trace ID, parent span ID, trace flags) and the `tracestate` to each message as metadata. In the Q&A they say the middleware is about 100 lines per queuing layer.

They also added sent, received and created timestamps, so time on the queue can be computed from traces, and the SQS FIFO subgroup ID, so blockages from the FIFO part of a queue are visible. One result they report: on a busy queue that had caused pain for years, almost all the longest-running messages came from a legacy piece of code they no longer needed. A small fix removed that dependency, and the queue then had ample capacity at all hours.

## Alert on latency, not size

Queue size is hard to tune, they say, because a thousand fast items and five slow ones look very different, and alerts need retuning as the system changes. It also isn't tied to what a customer experiences. Their analogy is a map app, which reports the extra minutes a traffic jam adds rather than the number of cars.

They switched to alerting mainly on latency, defined as service level objectives. A service level indicator marks each message good or bad, for example processed within 2 seconds. The objective sets what share must be good, which sets an error budget. They alert when the budget is exhausted and also when the burn rate means it would be breached within some number of hours. Alerts then fire only when customers waited longer than the agreed maximum, and don't need retuning when the system changes.

In their Friday-afternoon walkthrough, grouping concurrent messages by team ID showed one team using about a third of capacity for more than 30 minutes. Filtering further showed one request type, triggered by a webhook, was behind it.

## Tips from the talk

- Track total trace duration by putting the trace start time in `tracestate`, since async work outlives the route span.
- Run the OpenTelemetry Collector to add Kubernetes metadata, filter secrets and route telemetry to different backends.
- Use span links to split very long jobs into linked traces.
- Put the trace ID in logs and link both ways.

## What the talk doesn't say

- The results are from one company's C# systems with Honeycomb as the query backend, reported by the speakers themselves.
- The talk gives no numbers for cost. They keep 60 days of traces and store almost all of them, because tail sampling is hard when traces last hours. Their workaround is to spend more money.
- The talk doesn't show that latency alerts catch more incidents than size alerts, only that they found them easier to make useful.

What I'd take from it: when a queue alert fires, ask whether a customer waited longer than they should have, and make that the thing you measure.

*This post summarizes the linked talk transcript. The author hasn't run this setup.*
