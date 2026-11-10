---
title: "The scary part of a Postgres major upgrade isn't Postgres"
description: "Percona's operator now automates major version upgrades on Kubernetes. The risk that's left is the operating system library under the database."
pubDate: 'Nov 10 2026 09:00'
imageTag: 'Postgres'
heroImage: '../../assets/post-images/postgres-upgrade-is-not-the-scary-part.png'
imageTheme: 'red'
---

[Percona published a walkthrough](https://www.percona.com/blog/beyond-the-version-bump-running-postgresql-major-upgrades-in-percona-operator-for-postgresql/) of major version upgrades in its Operator for PostgreSQL (by Anil Joshi, Nov 9). I build Kubernetes operators for Postgres, so I read it closely. The upgrade mechanics are straightforward. What stood out is what the post says you have to check afterward.

## What the operator does

Before this feature, a major upgrade (say 16 to 17) on Kubernetes meant a manual dump and restore into a new environment, or logical replication. The post calls a manual in-place `pg_upgrade` "risky and unsupported" in that setup.

Now you create a `PerconaPGUpgrade` resource that names the cluster and the source and target versions. The operator then:

1. Pauses and shuts down the cluster.
2. Runs a Job that executes `pg_upgrade --link` on the primary's volume, creating a new data directory next to the old one.
3. Re-syncs the replicas from the upgraded primary.
4. Restarts the cluster on the new version.

The feature shipped as a technical release in v2.4.0 and is generally available in v2.9.0. The post is plain that this is downtime: the cluster enters a termination state and applications lose connectivity until it finishes.

## The part that isn't Postgres

From operator v2.6.0 the base image moved from UBI 8 to UBI 9. That changes glibc from 2.28 to 2.34, and glibc decides how text sorts. When the sort order changes underneath existing indexes, Postgres warns about a collation version mismatch.

The post's example needed `REINDEX INDEX CONCURRENTLY` on the affected index and `ALTER DATABASE ... REFRESH COLLATION VERSION`. It warns that a larger environment with many indexes could face corruption risk if collation problems aren't fixed first. It also says even patch-level OS changes can change glibc, so you should at least rebuild indexes.

So the version of Postgres isn't the only thing that changed. The upgrade also swapped the operating system library under the database, and nothing in the `pg_upgrade` output tells you what that did to your indexes.

## The rest of the checklist

- **Extensions** must be cross-validated. The post says pgaudit isn't upgraded automatically and has to be dropped and recreated in each database that has it.
- **Logical replicas** are invalidated by a major upgrade and need to be verified and reseeded.
- **Testing:** the post "strongly recommend[s] at least three trial upgrade rounds" plus application validation before cutover.

## Where the post contradicts itself

On rollback, one passage says the leader keeps its old data directory "for any rollback or recovery purposes." Another says that with `--link`, the old directory "is not usable in the event of a rollback or recovery." Hard links share data files with the new cluster, so I'd assume the second statement is the safe one and plan the rollback as a restore from backup. The post links a ticket (K8SPG-1235) about changing the cleanup behavior.

## What I'd take from it

Automating the upgrade removes the manual steps. It doesn't remove the need to rehearse. Run it on a copy of production data, check collations and extensions afterward, and know how you would roll back before you start.

*This post summarizes Percona's article and adds my own reading. I haven't run this upgrade myself.*
