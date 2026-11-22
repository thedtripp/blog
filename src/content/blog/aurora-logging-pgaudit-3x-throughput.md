---
title: "Verbose logging cost Aurora PostgreSQL 10% of throughput. pgaudit cost two thirds."
description: "An AWS pgbench test shows database logging is free at 8 clients and expensive at 800. At 800 clients, adding pgaudit cut throughput from 16,202 to 5,039 TPS."
pubDate: 'Nov 20 2026 13:00'
imageHeadline: '3x less throughput from audit logging'
imageTag: 'Aurora PostgreSQL'
imageExpression: 'lightbulb'
heroImage: '../../assets/post-images/aurora-logging-pgaudit-3x-throughput.png'
imageTheme: 'red'
---

An AWS Database Blog post, [Performance impact of excessive logging in Amazon Aurora PostgreSQL](https://aws.amazon.com/blogs/database/performance-impact-of-excessive-logging-in-amazon-aurora-postgresql/) (Nov 19), tested the same PL/pgSQL function under three logging settings. At 8 clients the three were indistinguishable. At 800 clients, adding pgaudit cut throughput by about three times. The author attributes it to the log-writing path, not queries, locks or storage.

## The setup

The test ran on a db.r6i.4xlarge Aurora PostgreSQL 17 cluster with pgbench on an EC2 instance in the same VPC. The function, `fn_process_request`, does what many API-backing functions do: it reads a few config values, calls a nested validation function, builds a JSON response and writes three audit rows. That is around 15 SQL statements per call.

Three configurations, nothing else changed:

1. Minimal: `log_min_duration_statement = -1`, default verbosity.
2. Verbose: `log_statement = all`, `log_min_duration_statement = 0`, `log_error_verbosity = verbose`.
3. Verbose plus `pgaudit.log = 'ALL'`.

## Low concurrency: nothing to see

With 8 clients for 20 seconds, throughput was about 2,603 TPS (minimal), 2,612 TPS (verbose) and 2,549 TPS (verbose plus pgaudit). The post calls these within normal run-to-run variance. Test this way and you would conclude logging is free.

## 800 clients: a different result

With 800 clients for 40 seconds:

| Configuration | TPS | Average latency |
| --- | --- | --- |
| Minimal | 16,202 | 49.058 ms |
| Verbose | 14,654 | 54.437 ms |
| Verbose plus pgaudit | 5,039 | 158.109 ms |

Verbose logging alone cost about 10 percent and made throughput oscillate on a roughly 10-second cycle. With pgaudit, throughput dropped to a plateau of about 3,600 to 3,700 TPS, with latency pinned around 218 ms.

## Where the time went

Sampling `pg_stat_activity` once a second showed the difference. Under minimal logging, sessions waited on `LWLock:BufferContent` and the commit sync, which the post calls an ordinary picture for a write-heavy workload. With pgaudit, nearly every active session showed no wait event, and CloudWatch Database Insights showed 784 of 797 average active sessions in the CPU bucket. The post reads this as the bottleneck sitting in the log-writing path, which PostgreSQL's wait events don't instrument.

The log files agree. During the pgaudit run an extra rotated log file reached 537 MB, written in well under a minute, against a normal rotation size of 400,000 KB. The post's explanation: pgaudit logs an entry for every nested statement inside a function, with full statement text, so one call can produce close to 15 entries.

## What it suggests checking

- Run `SELECT name, setting FROM pg_settings WHERE name LIKE 'log%' OR name LIKE 'pgaudit%'`.
- If you must keep auditing, `pgaudit.log_statement = off` keeps who, what and when but drops the SQL text that drives most of the volume. The post says to confirm the reduction on your own workload.
- Audit only the statement classes you need. The post says many compliance requirements are met with `pgaudit.log = 'write, ddl, role'`, and that object-level auditing can narrow it further.
- Test logging changes at production-like concurrency, not a handful of connections.

## Limits

- This is one synthetic function on one instance size, run once per configuration, with whole-run averages. The post calls it a small reproducible example, not a benchmark.
- The post is AWS's own, about its own service. I haven't reproduced it.
- The `log_statement = off` and role-level auditing suggestions are untested by the post, which says to verify them.
- The post says verbose and audit logging aren't mistakes; the cost depends on concurrency and on how many statements run inside functions.

*This post summarizes the linked AWS article. The author hasn't run these tests.*
