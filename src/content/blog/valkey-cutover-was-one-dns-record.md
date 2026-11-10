---
title: "Topstep moved 53 million keys with one DNS change"
description: "A trading platform replaced a single self-managed Redis node with ElastiCache for Valkey. The cutover was a DNS record. The TLS certificate was the part to plan for."
pubDate: 'Nov 09 2026 09:00'
imageTag: 'Valkey'
heroImage: '../../assets/post-images/valkey-cutover-was-one-dns-record.png'
imageTheme: 'green'
---

[Topstep and AWS published a migration write-up](https://aws.amazon.com/blogs/database/topsteps-migration-journey-self-managed-redis-oss-to-amazon-elasticache-for-valkey/) (Nov 9) about moving roughly 53 million keys from one self-managed Redis OSS 7.4 node to a Multi-AZ Amazon ElastiCache for Valkey 7.2.6 cluster. The headline is that the cutover took a few seconds. The useful parts are what made that possible and the one thing that nearly gets in the way.

## The starting point

For over a year, the cache for Topstep's trading platform ran on a single EC2 R5.4xlarge: one node, no replica, no automatic failover, in a shared management account next to CI/CD tooling. It held session tokens, BullMQ job queues (with Lua scripts that bundle several operations into one atomic step), and event-driven workflows.

The post says the nightly batch jobs competed with interactive reads on that one engine, pushing read P90 latency to about 250 ms.

## Why not the managed migration

Topstep wanted a blue/green cutover: a separate green environment to test under production-like load, with rollback one DNS change away. There was also a version problem. The source was Redis OSS 7.4, which is newer than the Redis OSS 7.2.4 point where Valkey forked. The post says that falls outside the range the managed migration supports, and the on-disk formats (RDB, AOF) differ.

The wire protocol is still compatible, so they used RedisShake in PSYNC mode, which replicates at the command level instead of moving files. It ran as a Kubernetes deployment on a dedicated memory-optimized EKS node. The two accounts were joined with VPC peering.

## The four phases

1. Provision the green cluster (cache.r7g.2xlarge, primary plus replica, Multi-AZ, TLS on) in a dedicated production account.
2. Sync with RedisShake until replication lag was near zero.
3. Check key-count parity, run smoke tests, then change the Route 53 record from an A record pointing at the EC2 IP to a CNAME pointing at the ElastiCache primary endpoint, with a 30-second TTL.
4. Keep the old Redis running as a warm standby during a soak period, then decommission it.

## The TLS catch

With TLS on, the ElastiCache certificate covers the `*.<cluster-name>.<id>.use1.cache.amazonaws.com` name, not the custom hostname the applications use. Standard hostname verification fails when clients connect through the custom name.

Topstep did not turn verification off. They kept CA-chain verification (`rejectUnauthorized: true`) and used Node's `tls.checkServerIdentity` to check the certificate against an allowlist of valid AWS endpoint names, loaded from Secrets Manager as `REDIS_TLS_ALLOWED_CERT_NAMES`. That is why the only application change was a small TLS configuration update.

## Reported results

Read P99 about 1.25 ms, read P90 sub-millisecond, write P99 about 0.5 ms. The post says the nightly burst latency dropped from about 250 ms P90 to "well within the team's target," and that patching and backups moving to the service frees roughly 1 to 2 engineer days per month.

## What the post doesn't say

- The latency numbers are for the new cluster only. There is no before-and-after run on identical hardware, and the move also changed instance type (R5 to Graviton r7g) and added a replica, so the post can't attribute the improvement to Valkey itself.
- It doesn't give the cutover's effect on in-flight writes. During the DNS flip, the old and new nodes briefly coexist, and the post doesn't describe how writes made to the old node after the last sync were handled.
- It is a guest post written with AWS about an AWS service.

## What I'd take from it

Put a DNS name in front of the cache before you need to move it. The post's own lesson is that if clients connect by IP, add that layer first. And if you do, check what name the server certificate actually covers before the cutover window, not during it.

*This post summarizes the Topstep and AWS article and adds my own reading. I haven't run this migration myself.*
