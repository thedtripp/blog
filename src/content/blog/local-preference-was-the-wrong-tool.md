---
title: 'Local preference was the wrong tool for draining a link'
description: "How DeepL drains one AWS Direct Connect link for maintenance without disturbing other Regions, and why AS_PATH prepending beat the obvious knob."
pubDate: 'Nov 10 2026 12:00'
imageTag: 'Networking'
heroImage: '../../assets/post-images/local-preference-was-the-wrong-tool.png'
imageTheme: 'purple'
---

[AWS published a post](https://aws.amazon.com/blogs/architecture/how-deepl-keeps-closest-exit-routing-during-maintenance-with-aws-cloud-wan/) on how DeepL drains a single AWS Direct Connect link for maintenance (Nov 9, by Guzman Freigedo, Oliver Geiselhardt-Herms, Rojda Mueller and Toni Gharib). The interesting part is the choice of routing knob.

## The setup

DeepL runs workloads in six AWS Regions. Three Direct Connect locations (Dublin, Copenhagen and Stockholm) each have a hosted 25 Gbps connection. One global Direct Connect gateway links all three and attaches to an AWS Cloud WAN core network. Two European data centers advertise the same prefixes, so the gateway learns them over all three locations.

By default, traffic leaves through the location closest to its origin Region, which keeps latency low. The goal: take Dublin out for maintenance without disturbing the other Regions' local exits.

## The obvious knob doesn't work

Lowering the BGP local preference for Dublin is the textbook way to move traffic off a link. The post explains why it's wrong here. Local preference on the gateway applies to a prefix for every Region at once, and the gateway evaluates it before AS_PATH. Changing it would move the other Regions' traffic too.

## What they use instead

Each Cloud WAN edge compares AS_PATH length first. A path through a peer edge is one hop longer than the local path, so each edge prefers its local Direct Connect location by default.

To drain Dublin, DeepL prepends AS_PATH on the Dublin virtual interface. Only the eu-west-1 edge sees its local path become longer than the peer path, so only that edge changes its decision. The Copenhagen and Stockholm edges keep exiting locally.

Two details worth copying:

- **Prepend more than once.** DeepL uses five. The post says at least two, because one prepend only ties the path length, and on a tie the gateway-learned route wins.
- **Move both directions.** They also lower local preference on their own routers for the Dublin sessions, so traffic toward AWS shifts too.

No routes are withdrawn and all BGP sessions stay up, so there's no convergence gap while routes are re-learned.

## The costs the post admits

- Inter-Region data transfer charges for the whole maintenance window.
- Without Cloud WAN routing policies, AWS picks between Copenhagen and Stockholm as the fallback, and DeepL can't choose which.
- The two directions can end up on different locations. If a stateful firewall sits in the path, both directions have to use the same one.
- Regions with no local Direct Connect location (the US and Tokyo here) need egress checks before and during the drain.

DeepL plans to adopt routing policies later for deterministic failover.

## What I'd take from it

When you need to change one thing, pick the knob that affects only that thing. Local preference was global to the prefix and AS_PATH was per edge, so the weaker-looking tool was the right one. The post describes expected behavior and gives no measured results, so treat it as a design to check against your own network.

*This post summarizes AWS's article and adds my own reading. I haven't built this setup. The text I had was cut off partway through the routing-policies section.*
