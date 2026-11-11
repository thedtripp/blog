---
title: 'Athena now keeps a table of every query it runs'
description: "Athena's new system tables make query telemetry something you can query with SQL, in an open table format you own."
pubDate: 'Nov 10 2026 15:00'
imageTag: 'Data'
heroImage: '../../assets/post-images/athena-keeps-a-table-of-every-query.png'
imageTheme: 'blue'
imageExpression: 'excited'
---

[Amazon Athena introduced system tables](https://aws.amazon.com/blogs/big-data/amazon-athena-introduces-system-tables-for-query-execution-observability/) (Nov 9, by Pathik Shah, Raza Hafeez and Theo Tolv). The first one, `query_executions`, records one row for every query that completes, successful or failed, across your workgroups. The idea is a good one and worth a look even if you don't use Athena.

## What's in it

Each row carries the identity and context of the query: workgroup, catalog, database, tables, region, and the principal that ran it. It also has timing (total execution, planning and queue time), resources (bytes scanned and DPU count), and the outcome, including error details.

Data shows up within minutes of a query finishing.

## Where it lives

The table is Apache Iceberg on Amazon S3 Tables, in your own account. Athena creates a service-managed table bucket for it and handles schema, partitioning, compaction and snapshot maintenance. You turn it on once in the console under Administration, then System tables, optionally choosing a KMS key (otherwise SSE-S3).

Because the data is a standard Glue Data Catalog table in an open format, the post says other Iceberg-compatible engines such as DuckDB and Amazon Redshift can read it too.

## What you'd use it for

AWS's examples are the kind of questions you'd otherwise answer with a spreadsheet and a guess:

- Daily query volume over 30 days, or by hour for peak analysis.
- Weekly adoption by workgroup, with distinct users.
- Total TB scanned by workgroup and region, for chargeback. Group by principal for a per-user breakdown.
- The slowest 50 queries over 7 days, week-over-week P95, and queue time.

A sketch of the chargeback query, adapted from the post's examples (confirm the column names in your own account):

```sql
SELECT work_group_name,
       sum(data_scanned_size) / power(1024, 4) AS tb_scanned
FROM "s3tablescatalog/aws-athena"."metadata"."query_executions"
WHERE submission_date_time > current_timestamp - interval '30' day
  AND state_enum = 'SUCCEEDED'
GROUP BY work_group_name
ORDER BY tb_scanned DESC;
```

## Why I like the design

Observability data is usually trapped in a vendor's UI. Here the engine writes its own telemetry to a table you own, in an open format, and you query it with the same SQL as everything else. It also means an agent can answer "which team scanned the most last month?" with read-only access to the table and no new tooling.

## What the post doesn't say

The part of the post I had gave no price for system tables, just a pointer to Athena's per-TB pricing page. Retention is "configurable", with no default or range shown. Check both before turning it on for every workgroup, since the table is data you pay to store and scan.

*This post summarizes AWS's article and adds my own reading. I haven't used the feature. The text I had was cut off partway through, so there may be limits I didn't see.*
