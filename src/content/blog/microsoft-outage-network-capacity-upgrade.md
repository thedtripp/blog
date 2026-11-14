---
title: "Microsoft says its 365 outage started with a network capacity upgrade"
description: "Microsoft says the outage that hit Outlook, Teams and Copilot was introduced during a network capacity upgrade, not an attack. BBC and The Verge report, as of Nov 14."
pubDate: 'Nov 14 2026 09:00'
imageHeadline: 'Microsoft blames network upgrade, not attack'
imageTag: 'Microsoft 365'
imageExpression: 'thinking'
---

Microsoft says the global outage that took down Outlook, Teams and Copilot "was a technical issue not related to cyber or AI / agents," and that it "was introduced by an issue during an earlier network capacity upgrade that surfaced following a recent network change." That is the wording [The Verge](https://www.theverge.com/tech/1032862/microsoft-outlook-down-outage) quotes from Microsoft's status update. Everything below is as of November 14, and Microsoft has not yet published its full report.

## What the cause statement says

Yesterday this site [compared three outlets' accounts of the cause](/blog/outlook-outage-three-different-causes/), and none could report a confirmed root cause. The new development is that Microsoft's own statement now names one. Both the [BBC](https://www.bbc.co.uk/news/articles/c6rrg51rkz09o) and The Verge report it: a network capacity upgrade, followed by a network change that exposed the problem. The BBC adds that Microsoft said it was not caused by a cyber-attack or an artificial intelligence agent.

Microsoft also said it "will provide a full post-incident report once our review is complete," according to The Verge. The BBC says the same. Until then, the statement describes where the problem started, not why one upgrade could affect so many services.

## How long it took

The BBC reports that Microsoft first acknowledged on Thursday, at 17:54 GMT, that users in the Americas could not reach Exchange Online mailboxes, and shortly after warned that Microsoft 365 might be affected globally. By 04:36 GMT on Friday it was still reporting only a "partial recovery" in some parts of the world. Early on Saturday morning, the BBC says, Microsoft said its efforts were complete and that customers of Outlook, Teams and Copilot should no longer be affected.

Microsoft says it restored service in stages. In its words, "given the scale of demand, we restored services gradually, validating stability at each stage. While this took longer, it helped ensure a stable restoration."

## Who felt it

According to the BBC, the outage reached more than 70 countries and hit services as varied as government offices, courts, hospitals and trains. It also reports that, via Politico, staff of the US House of Representatives said the outage set back a whole day of legislative work because everything ran on Outlook. The BBC notes that more than 430 million people use the affected products worldwide.

## What outside experts took from it

The BBC quotes two people who were not involved in the incident. Rob Demain, chief executive of the cybersecurity firm e2e-assure, called it "a stark reminder of how heavily we rely on a handful of big tech providers." Matt Saunders of the consultancy Adaptavist said that "classic IT disaster planning strategies suggest using a second service for resilience, but in practice, it's almost impossible for a business to function without tools such as Microsoft." His advice: have "a plan in place for how to work without such tools."

My reading of that, as someone who has only the reporting to go on: the practical question for a team is not whether a vendor will have an incident, but what the plan is for the day it does, such as another way to reach staff when email is down.

## Limits

- The cause is Microsoft's own statement, relayed by the BBC and The Verge. It is not an independent finding, and the full post-incident report is still to come.
- Yesterday The Verge also reported, citing its own sources, that the outage was linked to Azure VNet configuration changes. Today's statement does not mention Azure VNet, and I am not claiming the two are the same thing.
- A report from Ars Technica refused to load for me (it returned a 403), so I have not read it and nothing here relies on it.
- I am not predicting what the full report will say.

*This post summarizes reporting from the BBC and The Verge as of November 14. I have no information beyond those reports.*
