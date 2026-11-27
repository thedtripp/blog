---
title: "Adding a table back to a MySQL replica without touching the primary"
description: "Percona's walkthrough: dropping a table from replication is a one-line filter change, but adding it back means a mydumper snapshot and a replica stopped at the exact binlog position."
pubDate: 'Nov 27 2026 13:00'
imageHeadline: 'Re-adding a table: stop at the binlog position'
imageTag: 'MySQL replication'
imageExpression: 'squint'
---

Excluding a table from a MySQL replica takes three statements. Putting it back is harder, and getting it wrong can mean rebuilding the replica. Bhuvanes Waran of Percona wrote up the safe way in [A Practical Guide to Adding and Updating MySQL Replication Filters](https://www.percona.com/blog/a-practical-guide-to-adding-and-updating-mysql-replication-filters/), published Nov 27 2026. This post summarizes it.

## Why replication filters

Replication filters let a replica hold only the data a team needs: transaction data for one team, analytics data for another, or a multi-source replica combining several sources. The post notes that replicating less also reduces resource use. Needs change, so filters have to change too.

## Stopping a table is the easy direction

To stop replicating a table, you stop the replica, add the table to the filter, and start it again. The example uses `sbtest.sbtest3`:

```sql
STOP REPLICA;
CHANGE REPLICATION FILTER REPLICATE_IGNORE_TABLE = (sbtest.sbtest3);
START REPLICA;
```

To confirm the table stopped receiving writes, the post hashes a full `SELECT` of the table with `pager md5sum`. Three runs returned the same hash, `b3454182d67ebeb29a453cc18f5d50e6`, across 100,000 rows.

## Adding it back: a dump alone isn't enough

Restoring a dump onto the replica is not enough for a live table. The replica also has to resume from the right file and position. The post's plan has six steps:

1. Stop replication on the target replica.
2. Take a consistent mydumper backup from the primary or another suitable replica, capturing the primary's binlog file and position for that snapshot.
3. Start replication on the target replica until that file and position.
4. Restore the dump on the target replica.
5. Update the replication filter.
6. Start replication.

## The example

**Step 1.** The target replica uses multi-threaded replication, so the author runs `STOP REPLICA` and then `START REPLICA UNTIL SQL_AFTER_MTS_GAPS`. That lets the parallel applier threads fill any gaps so the position is consistent, and the SQL thread then stops by itself. With a single applier thread, the post says you can skip this and just run `STOP REPLICA`.

**Step 2.** To avoid touching the primary, the dump comes from another replica, using mydumper's `--replica-data` option so the metadata file records the primary's coordinates. In the example they were `binlog.000024` at position `950744300`. The dump was 19M in total (the table's four data chunks plus schema files).

**Step 3.** Start replication until those coordinates:

```sql
START REPLICA UNTIL SOURCE_LOG_FILE='binlog.000024', SOURCE_LOG_POS=950744300;
```

After some time the SQL thread stopped on its own, with `Exec_Source_Log_Pos` at 950744300.

**Step 4.** Restore with `myloader`. Because the SQL thread is paused at the dump's position, the restore doesn't conflict with changes the replica is applying.

**Step 5.** Remove the table from the filter. With one table, that is `CHANGE REPLICATION FILTER REPLICATE_IGNORE_TABLE = ();`. If several tables are filtered, list the ones you want to keep ignoring.

**Step 6.** `START REPLICA`, then check that the table receives writes and that there are no replication errors. The post also suggests `pt-table-checksum` for a consistency check.

## Limits and what the post doesn't say

- This is one lab-style example on a single 100,000-row table, not a benchmark or a production case study.
- mydumper printed a warning: with `--trx-tables`, binlog coordinates are not accurate if you write to non-transactional tables.
- The replica in the example was already behind: `Seconds_Behind_Source` was 868 in the first status output and 3756 after the final restart. The post doesn't discuss how lag affects the procedure.
- The post says its status output is trimmed for length, and its checks are hash comparisons plus a suggestion to run `pt-table-checksum`. I have not seen a checksum result.
- I haven't run this procedure. Try it on a replica you can afford to rebuild first.
