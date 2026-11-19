---
title: "86% of Kyverno's CEL engine allocations went to parsing the same Pod 16 times"
description: "A CNCF write-up profiled Kyverno's CEL admission path expecting slow policy evaluation. The cost was converting the admitted object once per matched policy."
pubDate: 'Nov 19 2026 13:00'
imageHeadline: '86% of allocations: parsing, not policy'
imageTag: 'Kubernetes'
imageExpression: 'lightbulb'
heroImage: '../../assets/post-images/kyverno-cel-cost-was-object-conversion.png'
imageTheme: 'blue'
---

A [CNCF post by Raunak Madan of Nirmata](https://www.cncf.io/blog/2026/11/18/optimizing-kubernetes-admission-control-where-kyvernos-cel-admission-cost-actually-goes/) (Nov 18) profiles Kyverno's CEL-based policy engines and finds the cost was not where the team expected. They assumed CEL evaluation would dominate. It barely registered.

## What the profile showed

In a heap profile of the ValidatingPolicy engine, `ConvertObjectToUnstructured` accounted for 86.8% of everything the engine allocated. After the fix it falls to 2.9%, and the largest single frame becomes `evaluateWithData`, the code that runs policy expressions. The MutatingPolicy engine paid a smaller but still substantial version of the same cost.

## Why

The API server sends the admitted object as raw JSON bytes. CEL can't read bytes, so Kyverno parses them into a map form first. That conversion sat inside the loop over matched policies instead of before it. With the Pod Security Standards set, roughly 16 policies match a typical Pod creation, so the same Pod was parsed 16 times. The cost grew with policy count and object size: O(policies), where it should have been O(1).

## The fix

Kyverno now builds the CEL request value once, before the loop, and every matched policy reuses it. To keep what policies see unchanged, it converts a copy of the request with the admitted object blanked out, then splices the object back in. The first attempt used one shared builder for every engine and testing caught that it changed behavior: validating and generating policies saw the object as sent, while mutating policies saw a normalized version. So each engine keeps its existing contract. The fix ships in Kyverno 1.19.2.

## The numbers

The benchmark calls the engine directly with a roughly 50 KB Pod and times the engine alone, not the webhook round trip, API server or etcd.

| Matched policies | Allocations before | after | Engine time before | after |
| --- | --- | --- | --- | --- |
| 1 | 2,327 | 854 | 0.31 ms | 0.10 ms |
| 16 | 37,055 | 2,718 | 4.91 ms | 0.16 ms |
| 64 | 148,131 | 8,672 | 20.01 ms | 0.36 ms |

The post says the slope is the point: allocations grew about 63 times going from 1 to 64 policies before, and about 10 times after.

## Against native admission policies

On one cluster with the same 16 Pod Security Standards policies, the post measured the API server's native ValidatingAdmissionPolicy at about 9.2 ms for one policy against Kyverno's 12.8 ms, and about 29 ms against Kyverno's 20 ms at the full set. Those Kyverno numbers come from 1.19.0, before the fix, and were not re-run. Kyverno's engine used about 3.2 cores against 8.2 for native under matched load.

## Limits the post states

- Single machine; it reproduces relationships between configurations, not absolute numbers.
- Mostly Go benchmarks that exclude network, webhook serialization and etcd. The engine comparison used loopback and dry-run.
- One JSON round trip of the admitted object per request remains, and tail latency (p95) under sustained load on a single replica is not addressed.
- The authors are Kyverno's own team, and they ask readers to run their own tests.

## What I'd take from it

If a profile points at a loop, check what inside it doesn't depend on the loop variable. Here the object was the same for every policy, and the work was repeated anyway.

*This post summarizes the CNCF article and adds my own reading. I haven't run these benchmarks myself.*
