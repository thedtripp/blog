---
title: "Google's 90% TPU claim is about moving the KV cache, not faster chips"
description: 'What TPU Sync actually changes for inference, which numbers Google published, and the caveats the coverage attaches to them.'
pubDate: 'Nov 09 2026 13:00'
imageHeadline: 'Google’s 90% TPU claim is a memory move'
imageDiagram: '{"nodes": [{"id": "pre", "label": "Prefill workers", "col": 0, "row": 1, "src": "disaggregated serving splits prefill and decode across separate workers"}, {"id": "sync", "label": "TPU Sync", "col": 1, "row": 1, "sub": "seconds to about 230 ms", "style": "muted", "src": "went from several seconds to about 230 milliseconds"}, {"id": "dec", "label": "Decode workers", "col": 2, "row": 1, "src": "disaggregated serving splits prefill and decode across separate workers"}], "edges": [{"from": "pre", "to": "sync", "label": "KV cache", "style": "hot", "src": ["the KV cache has to move between them", "TPU Sync looks aimed at that gap"]}, {"from": "sync", "to": "dec", "label": "KV cache", "style": "hot", "src": ["the KV cache has to move between them", "TPU Sync looks aimed at that gap"]}], "note": "Google’s benchmark (The New Stack). Placement is the post’s reading."}'
imageTag: 'AI infra'
heroImage: '../../assets/post-images/tpu-sync-90-percent-is-a-memory-move.png'
imageTheme: 'blue'
imageExpression: 'shocked'
---

"Cuts inference latency by over 90%" is a big claim. The more useful question is what got faster. According to [The New Stack's write-up](https://thenewstack.io/google-tpu-sync-inference/), the claim is about the time spent moving the KV cache between kinds of memory.

## What TPU Sync is

Google announced its eighth-generation TPU on Monday and, alongside it, TPU Sync, an open-source system aimed at a problem that gets worse as context windows grow: moving data between different types of memory. It is written in C++ and moves data between accelerator memory, host DRAM, storage and the network, using zero-copy transfers and native `PjRtBuffer` hardware descriptors to avoid extra copies.

The article reports combined host-to-device and device-to-host throughput of 223 GB/s per Ironwood TPU host, close to the theoretical 256 GB/s limit of PCIe Gen5.

## The numbers, and what they were measured on

All of these are Google's own benchmarks as reported in the article:

- Moving KV caches for a 235-billion-parameter Qwen3 model went from several seconds to about 230 milliseconds. Average time to first token (TTFT) dropped 60% when relatively few requests were running at once.
- With a larger 480-billion-parameter model, the TTFT reduction reached 90%.
- With prefix caching at 64,000-token contexts, TTFT dropped by as much as 90%, throughput rose by more than 50%, and P99 inter-token latency fell 30%.

Note the shape of the claim. "More than 90%" applies to KV-cache transfer latency and TTFT "in some tests". The P99 inter-token improvement in the prefix-caching test was 30%.

## The catch

The article lists several:

- Results depend on the workload, how much cached data can be reused, and available network bandwidth.
- Per the project's GitHub repository, as the article reports it, the APIs are still changing, and Google recommends pinning to a verified commit or tagged release.
- Support is limited to Cloud TPU v7x and v6e, with specific JAX and PyTorch version requirements.
- On Nvidia: SemiAnalysis's InferenceX data shows GB200 and GB300 NVL72 systems ahead in parts of the disaggregated-serving performance curve. A direct comparison with a fully tuned TPU v7 setup has not been published.

## What I'd take from it

My reading: disaggregated serving splits prefill and decode across separate workers, so the KV cache has to move between them, and a transfer that takes seconds would eat much of the benefit. SemiAnalysis, cited in the article, says external TPU serving previously lacked the infrastructure to separate prefill and decode effectively. TPU Sync looks aimed at that gap.

It also ships with TorchTPU and supports vLLM and SGLang, so teams already on those engines can try disaggregated workloads on TPUs without rebuilding their serving stack. That is a smaller claim than "TPUs beat Nvidia", and it is the one the article's evidence supports. Whether TPUs match Nvidia on inference remains, in the article's words, an open question.

## What this post doesn't cover

I haven't read Google's repository or benchmark methodology, so I can't say how the tests were set up beyond what the article reports. The percentages above are vendor-reported.

*This post summarizes the source article. I haven't run TPU Sync.*

Source: [Google claims its new AI software cuts inference latency by over 90% — but there's a catch](https://thenewstack.io/google-tpu-sync-inference/), The New Stack, Nov 9 2026.
