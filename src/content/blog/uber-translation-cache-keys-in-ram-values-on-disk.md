---
title: "Uber's translation cache went from 800 MB of RAM to about 40 MB of metadata"
description: "Uber moved translation values to disk and kept only keys in memory. Cache hits stayed above 99.9%. The catch is that the design fits a read-heavy workload."
pubDate: 'Nov 21 2026 13:00'
imageHeadline: '800 MB cache cut to 40 MB'
imageTag: 'Go cache'
imageExpression: 'thinking'
heroImage: '../../assets/post-images/uber-translation-cache-keys-in-ram-values-on-disk.png'
imageTheme: 'blue'
---

Uber redesigned the Go cache that serves its translations. In one example the cache went from roughly 800 MB in memory to roughly 40 MB of metadata, and the hit rate stayed above 99.9%. [InfoQ's write-up](https://www.infoq.com/news/2026/11/uber-go-translation-cache/) (Nov 20) summarizes Uber's own engineering post. The numbers below are Uber's, as reported there.

## Two problems found by profiling

Memory profiling across Uber's Go services showed two things. Garbage collection (GC) used more than 20% of CPU in some services, and translations accounted for about 70% of allocated objects. The cache also had a refresh problem: the service built a replacement cache in the background and swapped it in atomically, so both copies sat in memory at once. Some services ran out of memory during refreshes.

## Step one: fewer objects

The first change replaced Go's `sync.Map` with a plain `map[string]string` guarded by an `RWMutex`. The workload was mostly reads, with rare updates and no deletions of individual entries. `sync.Map` created multiple objects and pointers per entry. The plain map created fewer, and CPU utilization in the affected service improved by more than 30%.

## Step two: keys in memory, values on disk

Fewer objects did not fix the memory total. A translation dataset can hold two to three million keys, but a given service usually touches a small subset. Uber considered an external cache and generating a subset per service, and judged both too costly to operate or maintain.

It chose a hybrid design that keeps the existing `Get()` and `Put()` API. All keys stay in memory. Values live in disk-backed files. The details reported:

- 256 shards, each with its own read-write mutex, in-memory entries and disk file
- six-byte hash-based keys to cut metadata, with a fallback to the original key on collisions
- a time-based global LRU (least recently used) policy for in-memory entries
- on refresh, translations accessed in the previous 15 minutes are preloaded, so the swapped-in cache isn't cold

## The numbers

A dataset that used about 800 MB in memory needed about 40 MB of metadata afterward. With a limit of 50,000 in-memory entries, actual use typically ran between 80 MB and 120 MB. In another workload, about 30,000 of more than four million entries were in memory, the hit rate stayed above 99.9%, and p99 latency for disk-backed misses stayed below 100 microseconds. The headline also cites p99 under one millisecond.

## Limits: what this doesn't say

These are Uber's figures from specific workloads, not a benchmark anyone else ran. The design leans on traits the post describes: reads far outnumber writes, nothing is deleted one entry at a time, and each service uses a small slice of a big dataset. A cache with heavy writes or a flat access pattern wouldn't get the same result from this. The summary also doesn't give the disk type.

## What I'd take from it

The team's own advice is to minimize object references to cut GC cost, and to measure how often cached values are actually read before deciding what has to stay in RAM.

*This post summarizes a secondary write-up of Uber's post. I haven't run any of this myself.*
