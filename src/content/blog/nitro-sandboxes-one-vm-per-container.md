---
title: "Nitro Sandboxes give each container its own VM, at no extra charge"
description: 'AWS says Nitro Sandboxes put each EKS pod or ECS task in its own hardware-isolated VM with its own kernel, without a separate instance per workload.'
pubDate: 'Nov 11 2026 09:00'
imageTag: 'Container isolation'
heroImage: '../../assets/post-images/nitro-sandboxes-one-vm-per-container.png'
imageTheme: 'green'
imageExpression: 'neutral'
---

Containers on a shared node all trust one Linux kernel. AWS's argument for its new Nitro Sandboxes is that a single kernel issue can lead to data exposure across pods or tasks, and that with the current rate of Linux CVEs, containerized workloads need each workload isolated from the others and from cluster operators. The [AWS Compute Blog post](https://aws.amazon.com/blogs/compute/nitro-sandboxes-hardware-isolation-for-every-eks-pod-ecs-task-and-ec2-workload/), published November 10, 2026, describes the fix.

## What it is

A Nitro Sandbox is a lightweight virtual machine that you launch and control from your EC2 instance. To the instance it behaves like a child VM. The Nitro System enforces separation between the sandbox and its parent instance, between sandboxes, and between the sandbox and AWS operators. The parent contributes vCPU, memory, and I/O.

Because a sandbox is a first-level guest with no nested hypervisor, AWS says compute and memory run at near-native EC2 performance. The pitch is that you can give every workload that needs a hard boundary its own VM without giving it its own instance.

## How it differs from Nitro Enclaves

The post says Sandboxes share the isolation technology behind Nitro Enclaves, adjusted for containers in three ways:

- A sandbox's vCPUs can share cores with the parent instance through time slicing. Enclaves take dedicated cores.
- The parent can attach standard virtio network and block devices, not only a vsock channel.
- You can run the sandbox through a standard virtual machine monitor such as Firecracker.

## Two modes on EKS and ECS

- **Isolated sandbox:** each pod or task runs in its own VM with its own kernel, which protects the node and neighbors from anything inside. The node and its operators are still trusted.
- **Confidential sandbox:** the sandbox is attestable. Image loading is gated by a Cedar policy, image contents are verified inside the sandbox, and the ephemeral layer is encrypted. AWS KMS key policies can require specific attestation measurements before a key is released, so secrets reach only code you approved. AWS says neither the cluster administrator, the platform team, nor AWS can read pod or task memory.

On EKS Auto Mode you add `runtimeClassName` to the pod spec, using `confidential-sandbox` or `isolated-sandbox`. On ECS you use ECS Managed Instances, enable `nitroEnclavesEnabled` on the capacity provider, and set `isolationMode` to `ISOLATED_SANDBOX` or `CONFIDENTIAL_SANDBOX` in a `trustedExecutionConfiguration` block of the task definition. Network policies and security groups are enforced on the parent, outside the sandbox.

## Where AWS says it fits

The post lists AI agents that run their own code (one sandbox per session, deleted when the session ends), SaaS tenants sharing nodes, CI/CD jobs running untrusted pull request code, and closed-weight models deployed in a customer's account.

Sandboxes are available on every EC2 instance type that supports Nitro Enclaves, in commercial Regions, at no additional charge. You pay for the instances plus the usual EKS Auto Mode or ECS Managed Instances fee.

## What the post doesn't say

- It gives no launch-time, density, or overhead numbers. "Near-native" is AWS's description of compute and memory, with no benchmark attached.
- It says the two modes let you choose between faster launch times and cryptographic attestation, but gives no launch times for either.
- Isolated mode still trusts the node and its operators.
- It is an announcement written by the vendor.

What I'd take from it: if your threat model is a shared kernel, this changes the cost of a hard boundary from an instance per workload to a flag on the pod. Whether the overhead is acceptable is something you would have to measure.

*This post summarizes the linked AWS announcement. I haven't run Nitro Sandboxes.*
