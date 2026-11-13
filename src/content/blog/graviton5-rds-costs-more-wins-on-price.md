---
title: "RDS's newest Graviton costs more per hour and still wins on price"
description: "AWS's own sysbench run: M9g on RDS for PostgreSQL ran 61,495 queries per second at $0.366 an hour. Here is the test setup and what it can't tell you."
pubDate: 'Nov 13 2026 13:00'
imageHeadline: '61,495 queries per second on the new Graviton'
imageTag: 'RDS PostgreSQL'
imageExpression: 'thinking'
heroImage: '../../assets/post-images/graviton5-rds-costs-more-wins-on-price.png'
imageTheme: 'purple'
---

The new Graviton5 instances on Amazon RDS cost more per hour than the generation before, and AWS's benchmark says they are still the cheaper way to buy queries. The [AWS Database Blog post](https://aws.amazon.com/blogs/database/boosting-amazon-rds-with-aws-graviton5-benchmarks/) (published Nov 12) compares four instance generations on RDS for PostgreSQL. The numbers are AWS's, on a narrow test, so the setup matters as much as the result.

## The result

All four runs used db.xlarge sizes (4 vCPUs, 16 GiB). In the post's tables:

| Instance | Processor | Queries/sec | p95 latency | Hourly cost |
| --- | --- | --- | --- | --- |
| db.m6g | Graviton2 | 27,816 | 89.16 ms | $0.318 |
| db.m7g | Graviton3 | 32,529 | 78.60 ms | $0.337 |
| db.m8g | Graviton4 | 47,177 | 52.89 ms | $0.336 |
| db.m9g | Graviton5 | 61,495 | 40.37 ms | $0.366 |

M9g delivered 30% more queries per second than M8g and 121% more than M6g. The post says it cut p95 latency by 55% against M6g.

## The price angle

M9g is the most expensive of the four per hour. By my arithmetic from the table it costs about 9% more than M8g and about 15% more than M6g. The post's price-performance column still favors it: 604.9 million queries per dollar against 505.5 million for M8g and 314.9 million for M6g. That is 20% more than M8g and 92% more than M6g. Throughput grew faster than price, so the hourly premium was more than covered.

## How it was tested

- Sysbench `oltp_read_write`, 2 tables of 2,000,000 rows, 100 threads, 1,800 seconds per run.
- RDS for PostgreSQL 17.10, Single-AZ, default parameter group apart from enforced TLS.
- io2 storage with 10,000 provisioned IOPS and 200 GiB.
- A larger EC2 client (m9g.4xlarge, 16 vCPUs) in the same Availability Zone.
- Five runs per instance class, median reported.

The post says the working set stayed in memory and the instances ran at full CPU saturation, which isolates the effect of the processor generation.

## What the test can't tell you

That isolation is also the limit. With the data in memory and the CPU pinned, this measures how fast the processor generation chews through queries. The post itself says workloads with a different balance of CPU, memory and I/O will see different gains, and that results may vary with your workload and configuration. With 100 threads on 4 vCPUs, the p95 figures also describe a saturated instance, not a lightly loaded one.

Other caveats from the post: prices are On-Demand in us-east-1 as of writing, and M9g was available in N. Virginia, Ohio, Oregon and Frankfurt. Changing instance class on Multi-AZ completes with minimal downtime through automatic failover; on Single-AZ it needs a brief reboot.

## What I'd take from it

The generation-over-generation gain is large enough that it's worth a trial on your own workload. AWS recommends that too: test before upgrading production to confirm the gains carry over. The post links a CloudFormation template for reproducing the benchmark.

*This post summarizes AWS's article and adds my own reading. I haven't run this benchmark myself.*
