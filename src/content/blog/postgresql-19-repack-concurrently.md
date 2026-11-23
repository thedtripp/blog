---
title: "PostgreSQL 19 adds REPACK CONCURRENTLY, a VACUUM FULL alternative that doesn't block"
description: "PostgreSQL 19 can reclaim table space and reorder rows without blocking reads or writes, and lets administrators steer query plans without touching application code. A reading of the release summary, with the catch."
pubDate: 'Nov 23 2026 09:00'
imageHeadline: 'REPACK now runs without blocking reads'
imageTag: 'PostgreSQL 19'
imageExpression: 'thinking'
---

[InfoQ's summary of the PostgreSQL 19 release](https://www.infoq.com/news/2026/11/postgresql-19-released/) (Nov 22) lists a lot of changes. Two of them touch day-to-day operations more than the rest: a table repack that does not block reads or writes, and a way to influence query plans without editing queries.

## REPACK, without the blocking

PostgreSQL 19 adds `REPACK`. It reclaims unused table space and can reorder the data to match an index. With the `CONCURRENTLY` option it runs without blocking reads or writes. The summary calls it a potential replacement for common uses of `VACUUM FULL` and `CLUSTER`.

The wording is careful: "potential replacement" and "common uses". The summary does not say every case is covered, or what the operation costs in I/O or time while it runs.

## Steering the planner

Two new extensions, `pg_plan_advice` and `pg_stash_advice`, let administrators influence which query plan is chosen. Stored advice can be applied to queries by identifier, so a bad plan can be nudged without changing application code. What I'd take from it: that is most useful where you can't easily change the queries.

## Smaller changes worth knowing

- Parallel index vacuuming, changes to how autovacuum prioritizes work, and more monitoring views.
- `EXPLAIN ANALYZE` and related logging now report asynchronous I/O activity and the WAL generated for full-page images.
- Changes to foreign key checks made bulk inserts nearly twice as fast in testing. That figure is PostgreSQL's own, from its testing.
- Logical replication now supports sequence values.
- `WAIT FOR LSN` lets an application wait until a standby has replayed a given WAL position before querying it, which gives read-your-writes consistency on replicas.
- `INSERT ... ON CONFLICT DO SELECT` covers get-or-create, and `COPY` can output JSON.
- JIT compilation is now off by default, because its cost estimates proved unreliable. LZ4 becomes the default TOAST compression method when the build supports it.
- The server can present different TLS certificates by hostname (SNI), and a successful MD5 password login now produces a warning. MD5 was deprecated in PostgreSQL 18 and is planned for removal; SCRAM is the recommended replacement.

## What the summary doesn't say

It is a summary of the release, not a test of it. There are no benchmarks for `REPACK CONCURRENTLY` and nothing on how it behaves on large or busy tables. The nearly-2x bulk insert figure is PostgreSQL's own testing result, not an independent one.

The summary also notes a Hacker News discussion about whether production users should wait for PostgreSQL 19.1, and quotes one commenter who would wait for the first minor release on critical production systems. That is one commenter's view, not a finding.

If you run Postgres, the practical items to check against your own setup are whether you use `VACUUM FULL` or `CLUSTER` today, whether JIT being off by default changes any of your plans, and whether anything still authenticates with MD5.

*This post summarizes the linked article. I haven't run PostgreSQL 19 or tested any of these features.*
