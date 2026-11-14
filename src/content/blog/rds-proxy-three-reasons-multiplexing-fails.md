---
title: "RDS Proxy can quietly turn into a one-to-one pass-through"
description: "AWS lists three client behaviors that stop RDS Proxy from sharing PostgreSQL connections: SET statements, split pools, and open transactions. What the post says, and its limits."
pubDate: 'Nov 14 2026 13:00'
imageHeadline: '154 connections, none of them shared'
imageTag: 'RDS Proxy'
imageExpression: 'facepalm'
heroImage: '../../assets/post-images/rds-proxy-three-reasons-multiplexing-fails.png'
imageTheme: 'purple'
---

You put RDS Proxy in front of PostgreSQL to hold fewer database connections, and the number does not drop. A [post on the AWS Database Blog](https://aws.amazon.com/blogs/database/improve-rds-proxy-multiplexing-for-postgresql-part-1-common-causes/) says the cause is usually the client application, because certain client behaviors force the proxy to pass each client connection through to the database one-for-one. This is Part 1 of a two-part series, and it focuses on Java and Python clients.

## How the sharing is supposed to work

The proxy lends a backend connection to a client when a transaction begins and takes it back when the transaction ends, so a small pool can serve many mostly idle clients. The post says that when the proxy cannot be sure a connection is safe to reuse, it keeps the session on the same backend connection until the session ends. The three conditions below all put a session into that state.

## Condition 1: SET statements pin the connection

The post calls pinning the most common cause. A session-state change such as a `SET` command pins the client to one backend connection for the rest of the session. The post says the session pinning filter available for some other engines is not currently supported for PostgreSQL.

Where the `SET` comes from matters:

- **Older JDBC drivers.** In PostgreSQL JDBC driver 42.2.x or older, the driver sends `SET` commands during connection setup, so every connection is pinned before the first query. The post says 42.7.x and newer put those parameters in the startup packet, which avoids pinning.
- **Spark writes.** The post says Spark's DataFrame JDBC writer issues `SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ UNCOMMITTED` before every write. PostgreSQL runs READ UNCOMMITTED as READ COMMITTED, so the Spark write option `isolationLevel` set to `NONE` removes the statement at the same effective level. It is a Spark option, and putting it in the JDBC URL has no effect.
- **Application code.** psycopg2 and psycopg 3 pin only if your code issues a `SET`. The post suggests passing `application_name` as a connection parameter instead.

To spot it, the post says to compare `DatabaseConnectionsCurrentlySessionPinned` against `DatabaseConnections`. Its example graph shows `DatabaseConnections`, `DatabaseConnectionsCurrentlyBorrowed` and the pinned metric all at 154, meaning each backend connection is held by one client for its whole session. The post says some pinning is normal.

## Condition 2: Pool fragmentation

The post says the proxy partitions its backend pool by three values from the client's startup packet: username, database and `ApplicationName`. Clients that differ in any of them never share connections, even when idle. Its example splits 25 clients into three partitions using nine backend connections in total, two of them differing only in `ApplicationName`.

Causes it lists: separate database users per workload, a different `ApplicationName` per Spark job, and Python drivers that leave it empty. The signal is `DatabaseConnections` staying high while borrowed and pinned counts are low. The fix is to make the three values match: fewer users, and one `ApplicationName` per service rather than per job.

## Condition 3: Open transactions

With psycopg2 or psycopg 3 and autocommit off, the default, the driver starts a transaction on the first statement, including a `SELECT`. If the app then sits idle without committing, the backend connection stays borrowed. If the client disconnects mid-transaction, the proxy closes the backend connection instead of returning it to the pool. In metrics, `DatabaseConnectionsCurrentlyInTransaction` rises with `DatabaseConnections` while the pinned metric stays low. The fix: commit after each unit of work, and use autocommit where you don't need explicit transactions.

## Limits

- This is AWS's description of its own service, based on its own tests on Aurora PostgreSQL. The post says the same behaviors apply to RDS for PostgreSQL, but I haven't verified that.
- The 154-connection graph is an illustration from one test workload, not a benchmark or a typical result.
- Part 2, on diagnosing the root cause with CloudWatch Logs Insights and alarms, is not covered here.

*This post summarizes the AWS Database Blog article. I haven't run any of these configurations myself.*
