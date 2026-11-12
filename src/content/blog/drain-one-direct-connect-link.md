---
title: "DeepL drains one Direct Connect link without moving every Region"
description: "Local preference would have changed the exit for all Regions at once. An AS_PATH prepend changes it for one, because the decision is made at each Cloud WAN edge."
pubDate: 'Nov 09 2026 13:00'
imageHeadline: 'DeepL drains one Direct Connect link'
imageDiagram: '{"nodes": [{"id": "d", "label": "Dublin link", "col": 0, "row": 1, "sub": "AS_PATH prepended", "style": "muted", "src": "An on-premises AS_PATH prepend on the Dublin virtual interface"}, {"id": "w", "label": "eu-west-1 edge", "col": 1, "row": 1, "sub": "sees a longer path", "src": "The eu-west-1 edge sees its gateway path become longer than the paths from the eu-central-1 and eu-north-1 edges"}, {"id": "c", "label": "eu-central-1 edge", "col": 2, "row": 0, "sub": "exits via Copenhagen", "src": "eu-central-1 through Copenhagen"}, {"id": "n", "label": "eu-north-1 edge", "col": 2, "row": 2, "sub": "exits via Stockholm", "src": "eu-north-1 through Stockholm"}], "edges": [{"from": "d", "to": "w", "label": "prepend", "style": "dashed", "src": "An on-premises AS_PATH prepend on the Dublin virtual interface"}, {"from": "w", "to": "c", "label": "core network", "style": "dashed", "src": "so it sends traffic across the core network and out through Copenhagen or Stockholm"}, {"from": "w", "to": "n", "label": "core network", "style": "dashed", "src": "so it sends traffic across the core network and out through Copenhagen or Stockholm"}], "note": "Cloud WAN picks Copenhagen or Stockholm by default"}'
imageTag: 'Networking'
heroImage: '../../assets/post-images/drain-one-direct-connect-link.png'
imageTheme: 'purple'
imageExpression: 'thinking'
---

[DeepL and AWS published a write-up](https://aws.amazon.com/blogs/architecture/how-deepl-keeps-closest-exit-routing-during-maintenance-with-aws-cloud-wan/) (Nov 9) on taking a single AWS Direct Connect link out of service while every other Region keeps its closest exit. The interesting part is a BGP attribute they chose not to use.

## The setup

DeepL runs workloads in six AWS Regions: three in Europe (Ireland, Frankfurt, Stockholm), two in the US and one in Tokyo. Two European data centers connect to AWS through three Direct Connect locations (Dublin, Copenhagen, Stockholm), each a hosted 25 Gbps connection through Megaport. One global Direct Connect gateway links all three and is attached natively to an AWS Cloud WAN core network.

In steady state there is no traffic engineering. Traffic leaves AWS through the nearest location: eu-west-1 through Dublin, eu-central-1 through Copenhagen, eu-north-1 through Stockholm.

## Why not local preference

The obvious tool is BGP local preference. The post explains why it's the wrong one here. The Direct Connect gateway gives each Region its own preferred locations by default, but only while a prefix carries no local preference community. Tag a prefix and your ranking replaces that default for every Region at once. DeepL advertises the same /16 from both data centers, so lowering the preference on the Dublin advertisement would take away the closest exit from Regions that aren't being drained. Getting a different ranking per Region would mean more-specific prefixes per location, which is the per-link configuration they wanted to avoid.

Local preference is also evaluated before AS_PATH, so a longer AS_PATH on the Dublin path doesn't change the gateway's choice. The drain works on the core network edge instead.

## Where the decision actually happens

Each Cloud WAN core network edge receives the on-premises path from the Direct Connect gateway with the AS_PATH preserved. It also learns the same prefix from its peer edges, and each of those paths is one AS hop longer because the peer adds its own ASN. The edge evaluates AS_PATH length first, so by default it prefers the path through its local Direct Connect location.

That gives a per-Region lever. An on-premises AS_PATH prepend on the Dublin virtual interface changes the decision only on the edge that uses Dublin. The eu-west-1 edge sees its gateway path become longer than the paths from the eu-central-1 and eu-north-1 edges, so it sends traffic across the core network and out through Copenhagen or Stockholm. The other two edges are untouched.

All BGP sessions stay up, and no routes are withdrawn. The post says this avoids the convergence gap a withdrawal causes.

## The runbook, in short

1. Confirm each Region exits locally.
2. Prepend the prefixes on the Dublin virtual interface. Use at least two; DeepL uses five.
3. Lower local preference on the Dublin sessions on DeepL's own routers so traffic toward AWS moves too.
4. Verify the eu-west-1 edge picks a peer path and the other edges still exit locally.
5. Confirm traffic in both directions has left Dublin, then do the maintenance.
6. Reverse everything afterward.

## Caveats the post lists

- **One prepend is not enough.** It only ties the path length, and on a tie Cloud WAN prefers the route from the Direct Connect gateway, so the drained location stays in use.
- **You don't choose the fallback.** With default selection, Cloud WAN picks between Copenhagen and Stockholm. DeepL plans to use Cloud WAN routing policies to make that deterministic.
- **Asymmetric paths.** The prepend only steers traffic leaving AWS. Traffic toward AWS is chosen by DeepL's routers, so the two directions can use different locations. A stateful firewall in the path needs both directions on the same fallback.
- **Cost.** eu-west-1 traffic crosses Regions during the drain, which means inter-Region data transfer charges.
- **Regions with no local location.** Check the US and Tokyo Regions to confirm none of them still use the drained link.

## What the post doesn't say

It gives no measurements: no drain duration, no latency during the drain, and no figure for the transfer cost. The pattern also depends on native Direct Connect gateway attachments to Cloud WAN, so it isn't a general BGP recipe. The post says to validate each step in a non-production environment first.

## What I'd take from it

Before changing a BGP attribute, work out which component makes the decision and which attributes it looks at. Here the answer was a per-edge AS_PATH comparison, not the gateway's local preference.

*This post summarizes the DeepL and AWS article and adds my own reading. I haven't run this setup myself.*
