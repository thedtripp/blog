---
title: "LinkedIn replaced Argo CD with one pod per deployment"
description: 'LinkedIn says infrastructure-caused deployment failures fell from 925 to 63 after it replaced Argo CD with a per-deployment engine, though it credits other fixes too.'
pubDate: 'Nov 13 2026 13:00'
imageHeadline: '925 deploy failures became 63'
imageTag: 'GitOps'
imageExpression: 'thinking'
---

LinkedIn says it replaced Argo CD with its own GitOps engine, and that deployment-infrastructure failures fell from 925 to 63 while deployment volume rose 3.7x. InfoQ's [write-up by Claudio Masolo](https://www.infoq.com/news/2026/11/kubernetes-argocd-linkedin/) (Nov 12, 2026) covers LinkedIn's own post. The numbers are LinkedIn's, and they come with a caveat worth reading first.

## The setup

The engine deploys to more than 250 Kubernetes clusters, with clusters of up to 5,000 nodes. It supports over 4,000 services and handles more than 100,000 deployments a week. LinkedIn had started with one Argo CD instance per cluster, because Argo CD already managed its cluster add-ons that way. A central orchestrator spawned an ephemeral pod per deployment, with Argo CD hidden behind it.

## Two architectural problems

LinkedIn lists seven problems at scale. InfoQ calls two of them architectural.

First, Argo CD keeps one watch per group-version-resource across Applications. LinkedIn's clusters have low resource-type diversity, so etcd churn from one app can slow syncs for all apps. In one test, sync took under 3 minutes on a cluster with 60,000 pods and over 10 minutes with more than 80,000.

Second, server-side-apply PATCH. Kubernetes truncates managedFields once an object has had more than 10 distinct field managers, and the API server then forgets who owns a field. In LinkedIn's AI workloads, which run several containers per Pod, a container removed from a manifest could survive on the live Pod. Pruning was disabled because destructive operations in production need approval.

The rest were smaller: no observedGeneration to tie sync and health status to a specific deployment, CRD schema changes that required controller restarts across the fleet, OutOfSync states that didn't reflect real drift, and error messages buried in boilerplate. LinkedIn also evaluated Flux, found it shared the same controller paradigm, and built the engine as a library instead.

## What the new engine does

- Each deployment runs in its own pod, with no shared controller state.
- Updates use PUT (full replacement) instead of PATCH, and retry on resourceVersion conflicts with exponential backoff.
- A three-way diff across the live object, the previously deployed manifest and the newly rendered manifest detects drift. Real drift fails the deployment.
- The same pod then watches the object's status until it converges or times out, and surfaces the API server's error to the user.
- Objects missing from the rendered manifest become deletion candidates, subject to delete protection.

## Results, and the caveats

The median time to detect and conclude a failed deployment dropped from 16.1 to 2.45 minutes. The comparison uses the same calendar month a year apart: the migration ran from July 2025 to April 2026, so May 2026 is the first clean post-migration month.

## What the numbers don't say

- The failure count covers only failures caused by the deployment system and excludes drift errors, since the two systems define drift differently.
- LinkedIn states the improvement isn't solely from the new engine: the orchestrator's error classification and reliability also improved over the same period.
- Median duration for successful deployments is similar for both systems. The mean and tail improved, which the team attributes to a namespace-scoped informer cache.
- The engine is internal, and InfoQ mentions no open-source release.
- Argo CD is still used at LinkedIn for cluster add-ons and system services.

## What I'd take from it

InfoQ suggests two checks for teams running Argo CD at scale. Count the field managers on long-lived objects, since managedFields truncation can leave orphaned containers that produce no error. And check whether sync latency tracks total pod count on shared clusters, which points to watch contention.

LinkedIn's own conclusion is that the build-or-extend decision rests on the operational model: per-deployment isolation, not controller tuning, is what let the system scale with compute. Their setup, with 200+ Argo CD instances where each upgrade was a multi-week project, is far from a typical cluster, so I'd read this as a case study and not a reason to leave Argo CD.

*This post summarizes the linked article. I haven't run this system or reproduced these numbers.*
