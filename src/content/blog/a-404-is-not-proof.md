---
title: "A 404 isn't proof an endpoint is dead"
description: 'How I decided 249 failing sources in a data pipeline were really gone, and kept a way to find out if any came back.'
pubDate: 'Nov 09 2026 15:00'
imageTag: 'Reliability'
heroImage: '../../assets/post-images/a-404-is-not-proof.png'
imageTheme: 'green'
---

A data pipeline of mine polls a few thousand hosted public endpoints on a schedule. Over time some of them disappear, and for a while they just show up as failures in the logs. This week I removed 249 of them. Deciding they were dead took more care than deleting them.

## Why one failure means nothing

Hosted endpoints go down for a day and come back. A single 404 could be an outage, a redirect in progress, or a name that changed. If I remove on the first failure, I lose sources that were fine.

So a source only becomes a candidate for removal after **three consecutive failures** that are 404s, which is the signal that the name no longer exists. Timeouts and server errors don't count toward that streak, since they say more about the host than about the source.

## Why I re-probe before removing

The health data I keep only lists sources that are failing *right now*, and it forgets an entry 48 hours after the source stops failing. That makes it good for finding candidates and bad for answering whether a source has recovered.

So the cleanup tool re-checks every candidate live at the moment of removal. Only the ones still failing are removed.

## Why nothing is really deleted

Each removed source is appended to a permanent file that records what was retired. A separate recheck command reads that file, probes each entry again, and lists any that are live again. Restoring one is a manual step, so nothing comes back without me looking at it.

The cost of this is small: one extra file and one extra command. The benefit is that "did it come back?" is a question I can answer later, instead of something I lose when I delete a line.

## Not done yet

- The three-failure threshold is a fixed constant, not tuned from data.
- The recheck is a manual command, not a scheduled job.

Deleting is cheap. The part worth building is being able to ask later what you deleted and whether it should have stayed.
