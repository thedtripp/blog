---
title: "Lambda now runs GPU functions, with a 9.75 percent fee on top of EC2"
description: "AWS Lambda Managed Instances now supports G-series GPUs for Event Functions. What you get, what it costs, and the limits the announcement states."
pubDate: 'Nov 19 2026 09:00'
imageHeadline: 'GPU Lambda: EC2 price plus 9.75%'
imageTag: 'AWS Lambda'
imageExpression: 'neutral'
heroImage: '../../assets/post-images/lambda-gpu-fee-on-top-of-ec2.png'
imageTheme: 'purple'
---

[AWS announced](https://aws.amazon.com/blogs/aws/aws-lambda-now-supports-gpu-instances-for-event-functions-on-lambda-managed-instances/) on Nov 18 that Lambda Event Functions running on Lambda Managed Instances (LMI) can now use EC2 G-series GPU instances. The pitch is GPU work with serverless packaging: you build a container image, point a function at it, and Lambda handles provisioning, scaling and event wiring. This is a summary of that announcement as of Nov 19, 2026.

## What changed

GPU-accelerated functions deploy as OCI container images. Per the post, there are no GPU drivers, CUDA versions or AMIs to reconcile, and no clusters or device plugins to run. They sit on the same LMI foundation that already gives you EC2 pricing.

The same 200+ event sources that trigger Event Functions, including S3, SQS, API Gateway and EventBridge, can trigger GPU functions directly.

## The price

This is the line to read first. GPU instances run as EC2 On-Demand instances, and existing Savings Plans and Reserved Instances apply. On top of that you pay a 9.75 percent management fee for GPU instances, plus the standard Lambda request fee of $0.20 per million requests.

So the bill is the EC2 instance, a percentage on top, and per-request charges. AWS's argument for the fee is utilization: a small inference task can leave most of a provisioned GPU idle, and Lambda consolidates functions onto instances and serves concurrent requests on each GPU. Each execution environment can handle up to 48 concurrent requests.

## Limits stated in the announcement

- Optimized for inference, not training, and for custom models rather than large foundation models already offered on services like Amazon Bedrock.
- Container images up to 32 GB (10 GB per file), up to 32 GB of ephemeral storage, 2,048 to 32,768 MB of memory, and 3 to 48 GB of accelerator memory.
- Timeouts up to 90 minutes for asynchronous and event source mapping invocations.
- Supported instance families at launch: G4dn, G5, G6, G6f, Gr6, Gr6f and G6e, with more to come.
- New accounts might start with a quota of 0 for G-series instances, so you request an increase first.

## The walkthrough

The author deployed Qwen/Qwen2.5-1.5B-Instruct, a small model, using Lambda's vLLM base image. The Dockerfile is one line and the model is chosen with a `MODEL_ID` environment variable. They report that four concurrent invocations finished in about the same time as one, and that going from a Hugging Face model ID to a live OpenAI-compatible endpoint took about 10 minutes, mostly unattended.

The cold start happens when you publish a version, because each execution environment downloads the weights and warms up the engine before the version becomes active. The first caller doesn't wait for it. For production the post suggests copying weights to an S3 bucket in the same Region and streaming them into memory.

## What the announcement doesn't say

- There is no price comparison against running the same instance yourself, so whether the 9.75 percent fee pays for itself depends on how well your workload fills the GPU.
- The concurrency result is one small model on one test, not a benchmark.
- It is AWS's own announcement of its own product.

## What I'd take from it

If your inference workload is bursty and event-driven, the fee is a trade of a known percentage for not running GPU infrastructure. If your GPUs already run hot around the clock, work out what 9.75 percent is worth to you before switching.

*This post summarizes the AWS announcement and adds my own reading. I haven't run this myself.*
