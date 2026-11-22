---
title: "Lambda GPU first tests: 48 requests on one model, and a default quota of zero"
description: "Within a day of AWS adding GPUs to Lambda Managed Instances, hands-on reports found a zero default GPU quota, no Terraform support yet and a 484-second publish."
pubDate: 'Nov 22 2026 09:00'
imageHeadline: '48 requests, one GPU model, quota zero'
imageTag: 'Lambda GPU'
imageExpression: 'squint'
heroImage: '../../assets/post-images/lambda-gpu-first-tests-quota-zero.png'
imageTheme: 'green'
---

AWS added GPU support to Lambda Managed Instances. This post covers [the follow-up report](https://www.infoq.com/news/2026/11/aws-lambda-gpu-managed-instances/) (Nov 22) that adds the first hands-on results. Event Functions on Lambda Managed Instances can now run on EC2 G-series instances (G4dn, G5, G6, G6f, Gr6, Gr6f and G6e at launch), packaged as container images and triggered by the same event sources as any other function. It is generally available in commercial regions where both Managed Instances and G-series exist.

## What changes

Concurrent invocations in one execution environment share a single copy of the model in GPU memory, up to 48 per environment. Scaling follows GPU utilization, CPU utilization and concurrency. A function declares its GPU memory in a new `AcceleratorConfig` block, and a capacity provider lists the allowed instance types, the VPC and a vCPU ceiling. Lambda picks the newest generation with capacity and falls back to older ones.

AWS ships five GPU base images: CUDA only, CuPy, PyTorch, vLLM and SGLang. The vLLM and SGLang images need no handler code. A `MODEL_ID` variable points at a Hugging Face or ModelScope repository, an S3 prefix or a local path, and swapping models is a configuration change followed by a new version. In the words of AWS's Daniel Abib: "There are no GPU drivers, CUDA versions, or AMIs to reconcile, and no clusters or device plugins to operate."

## Price

The price is the EC2 On-Demand rate plus a 9.75 percent management fee and the standard $0.20 per million requests. That is lower than the 15 percent fee on CPU instance types. There is no duration charge, so an instance bills for as long as the minimum environment count is above zero. Savings Plans and Reserved Instances apply to the instance.

## What early testers found

Classmethod's Akaike tried every accelerated instance type in us-east-1 and found 37 of 81 accepted, all G-family. P-family, G7, Inferentia, Trainium and g5g were refused. A PyTorch benchmark ran about 66 times faster on the L4 than on the instance's CPU. Neither Terraform nor the Cloud Control provider knew `AcceleratorConfig` yet, and the GPU vCPU quota in a fresh account is zero: "if you use g6.xlarge (4 vCPU) with the default three instances, you need a quota of 12 vCPUs."

An AWS Community Builder writing as xbill ran Gemma 4 E2B on a single g6.2xlarge through the vLLM image. One environment served all 48 simultaneous requests, and all 417 calls succeeded, at roughly 130 tokens a second for a single request and 3,400 to 3,600 at 48. The friction was in the pipeline: 484 seconds from publish to an active version, and a Docker image index that Lambda rejected until it was pushed as a single-platform manifest. The handler returns complete replies, so time to first token could not be measured.

## What it doesn't cover

- Managed Instances still support only Event Functions. The GPU path does not reach Web Functions, and AWS has not said whether it will.
- Scaling is slower than regular Lambda. Yan Cui's earlier analysis of the model says launching new EC2 instances takes tens of seconds, so it is "not a good fit when you have large, unpredictable spikes in traffic."
- The 417-call test and the 66x figure are single hands-on reports, not benchmarks of the service.
- Limits from the launch post: container images up to 32 GB, 32 GB of ephemeral storage, 3 to 48 GB of accelerator memory, and a timeout of up to 90 minutes for asynchronous and event source mapping invocations.

xbill's verdict keeps to that scope: for a model behind events, queues or other AWS services, a Lambda GPU function is the simpler road. When streamed replies or full control of the server are needed, he writes, "run vLLM on an EC2 G6 yourself."

*This post summarizes the InfoQ report and the launch material it quotes. I haven't run any of it.*
