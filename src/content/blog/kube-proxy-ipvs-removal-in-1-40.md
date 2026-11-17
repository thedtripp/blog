---
title: "kube-proxy's IPVS mode is being removed in Kubernetes 1.40. Here's why, and where to go."
description: "Kubernetes SIG Network says the ipvs backend is deprecated as of 1.35 and will be removed in 1.40. The nftables backend is the recommended replacement."
pubDate: 'Nov 17 2026 13:00'
imageHeadline: 'IPVS removed from kube-proxy in 1.40'
imageTag: 'Kubernetes'
imageExpression: 'point'
heroImage: '../../assets/post-images/kube-proxy-ipvs-removal-in-1-40.png'
imageTheme: 'green'
---

If your cluster runs kube-proxy in `ipvs` mode, the Kubernetes project has set a date. Dan Winship of Red Hat wrote on the [Kubernetes blog](https://kubernetes.io/blog/2026/11/16/ipvs-removal/) on Nov 16, 2026 that SIG Network deprecated the backend in Kubernetes 1.35 and now plans to remove it in 1.40. It still works today, with a deprecation warning.

## Why IPVS existed

The ipvs backend was written to fix two scaling problems in the iptables backend, per the post:

- **Data plane latency.** iptables used a separate rule for each service IP, so each new connection was matched against a series of rules that grows O(n) with the number of services. The kernel IPVS subsystem uses hash tables instead.
- **Control plane latency.** kube-proxy rewrote the entire iptables ruleset on every service or endpoint change. In very large clusters, the post says, kube-proxy would use 100% of one CPU all the time just to process iptables updates. IPVS avoided rewriting everything on each update.

## Why it is going away

The post gives several reasons:

- The kernel IPVS API was a poor match for the Kubernetes Services API, and the backend never implemented all the edge cases of Service functionality correctly.
- The original authors moved on, and it took a while to find new maintainers.
- IPVS has no batch update API, so with many changes at once it can be slower than iptables. It also falls back to iptables for features beyond basic load balancing, so it inherits some of the same scaling problems.
- Red Hat plans to remove the iptables API from RHEL, so the ipvs backend would no longer be available to Kubernetes users there.

On IPVS schedulers: kube-proxy runs on every node and the nodes do not share scheduler state, so each node picks endpoints without knowing what other nodes are doing. The post says even the distributed-minded schedulers generally do not beat random selection in this setup.

## Where to go

- **nftables (recommended).** The nftables backend arrived in 1.29 and went GA in 1.33. The post recommends it if you run Kubernetes 1.36 or later with a node kernel of 5.13 or later, because some performance and scaling fixes were not backported before 1.36. It calls nftables feature-complete, with very slightly better performance than ipvs in its charts, and notes the point of the chart is that nftables is not slower, unlike iptables.
- **iptables.** If you cannot use nftables, the post says the 2026 iptables backend is much better than the 2017 one, with a trimmed ruleset, fewer allocations, and updates limited to changed services and endpoints. It is still not as good as ipvs, but the post suggests people who found it unusable before may not have problems now. For this switch it recommends rebooting each node, not just restarting kube-proxy.

Switching is mostly a configuration change. On kubeadm clusters, change `mode: ipvs` to `mode: nftables` in the kube-proxy ConfigMap and restart the kube-proxy pods. If you override ipvs-specific options, map them to their nftables equivalents.

## Limits

- The performance claims come from the Kubernetes project's own charts, which the post itself says show tiny differences. They are not a benchmark of your cluster.
- The post gives no numbers for how the iptables backend compares with ipvs today beyond "not as good".
- Plans can change. KEP-5495, which the post links, has the full timeline.

*This post summarizes the Kubernetes blog post. I have not run any of these migrations myself.*
