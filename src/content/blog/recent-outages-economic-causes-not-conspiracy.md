---
title: "A week of unrelated outages, and Schneier's economic explanation"
description: "Bruce Schneier says this week's outages at Microsoft, the FAA, banks, United and Apple were coincidences with a shared root: reliability is a cost that doesn't pay off this quarter."
pubDate: 'Nov 28 2026 09:00'
imageTag: 'Outages'
imageHeadline: 'Six outages, no common cause'
imageExpression: 'thinking'
---

[Bruce Schneier's essay](https://www.schneier.com/blog/archives/2026/11/recent-outages-have-economic-causes.html) (Nov 27) starts from a bad week: outages at Microsoft, the FAA, a handful of banks, United Airlines, an unnamed classified NSA network, and Apple. His first claim is the one engineers will want to check first: there is no common cause.

## What he says about the causes

Schneier writes that people could be forgiven for suspecting a coordinated cyberattack, a common cause, or a conspiracy, but that there is none. In his words the incidents are unrelated, they are not the result of any cyberattack, coordinated or not, and "they don't seem to be the result of AI." He makes one exception: he says nothing can be said about the NSA network, because we will probably never know the details of that one. His summary of the rest is "a series of unfortunate coincidences."

This is his reading as an observer. The essay doesn't walk through the technical post-mortem of each incident.

## Why coincidences keep happening

Schneier's argument is that the underlying fragility is shared even when the triggers aren't. He describes infrastructure that is:

- old, and incrementally patched and upgraded over decades
- in part maintained by hobbyists, without any recompense
- often without good backup systems
- increasingly centralized, so one failure cascades across many parts of life

"A lot of our tech infrastructure just barely works," he writes, "and when it fails, it can fail badly."

## The economic mechanism

The core of the essay is about cost. Security, safety, resilience, redundancy and recoverability are all costs, and Schneier points out they are costs that don't generate near-term profits. He argues that shareholder capitalism, private equity in particular, squeezes out apparent inefficiencies, and that monopolization removes the market competition that would otherwise push companies toward better service.

His line that sticks: from the perspective of a quarterly budget, spending on reliability is an inefficiency, an expense that doesn't generate revenue, and it "feels wasteful until something bad happens." If you're lucky, he adds, you can push the cost of failure onto society, which raises profits further. He gives the examples of being stranded in airports when planes don't fly, and dealing with the fallout when you can't withdraw money from your bank account.

## His proposed fix

Schneier says upgrading systems, removing single points of failure and making them more resilient are technical problems, but won't happen until the political and economic ones are fixed. His answer is regulation with enforcement and meaningful fines, plus stringent antitrust enforcement. He expects more failures until that changes.

## What I'd take from it

Reading this as an engineer: the useful part is the framing that redundancy and recovery work gets cut because it never shows up in a quarterly number, not because anyone decided reliability doesn't matter. Whether regulation is the right lever is a policy argument I can't settle from one essay.

## Limits

- It's an opinion essay (it first ran in The Guardian, and this is an expanded version), not an incident analysis. It doesn't give root causes for any of the individual outages.
- "Unrelated" and "not AI" are Schneier's assessments. He says himself that the NSA network can't be assessed.
- Comments under the post disagree, and some blame layoffs and AI-assisted coding. The essay itself doesn't support that.
- The economic explanation is an argument. The essay doesn't measure how much reliability spending any of the affected organizations cut.

*This post summarizes Schneier's essay. I haven't investigated the outages myself.*
