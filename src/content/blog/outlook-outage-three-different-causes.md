---
title: "Three outlets, three explanations for Microsoft's 365 outage"
description: "Microsoft stretched Outlook's email timeout to 48 hours after a 20-hour outage. The Verge, TechCrunch and the BBC each describe the cause differently, as of Nov 13."
pubDate: 'Nov 13 2026 09:00'
imageHeadline: 'Microsoft widens email timeout to 48 hours'
imageTag: 'Microsoft 365'
imageExpression: 'confused'
---

Microsoft said it was extending Outlook's email "timeout window" to 48 hours "to help protect delayed messages as delivery catches up," the [BBC reports](https://www.bbc.co.uk/news/articles/cwvg238zrnm5o). That is the practical consequence of an outage that, by the BBC's count, ran for more than 20 hours. Everything below is as of November 13, and the story is still moving.

## What happened

The [BBC](https://www.bbc.co.uk/news/articles/cwvg238zrnm5o) reports that Teams, Outlook and Copilot were hit, with customers unable to send or receive email, open some files or see calendar details. It lists schools, GP surgeries, courts, police forces and governments among those affected, and says more than 430 million people use Microsoft 365 apps according to Microsoft's website.

[TechCrunch](https://techcrunch.com/2026/11/13/microsoft-latest-email-outage-turned-into-a-full-blown-global-cloud-crisis/) adds that the outage also knocked out Defender and blocked administrators from their Intune dashboards. It quotes Doug Madory of Kentik saying traffic was returning to Microsoft's services after about 18 hours of downtime. [The Verge](https://www.theverge.com/tech/1032862/microsoft-outlook-down-outage) says Microsoft 365 was starting to recover as the outage entered a second day, with some apps still degraded and mail possibly delayed.

## What it means for your mail

The BBC says messages that arrive late will carry the time they were delivered, not the time they were sent. It also says you can't assume every email you sent will arrive promptly even after services resume.

## Three outlets, three accounts of the cause

- **The BBC** says Microsoft attributed the outage to "elevated load" on its infrastructure, stemming from an issue during an earlier network capacity upgrade.
- **The Verge** reports that, according to senior correspondent Tom Warren's sources, the outage is linked to Azure VNet config changes.
- **TechCrunch** says Microsoft hasn't said what caused it, only that it involved "a large number of servers being unexpectedly unavailable."

These aren't necessarily contradictory, since the Verge's figure comes from unnamed sources and the others from Microsoft's statements at different times. But no outlet reports a confirmed root cause. The Verge says Microsoft promised a full report after the issues are mitigated.

The Verge and TechCrunch report that Microsoft found no evidence of malicious activity, and the BBC says Microsoft described it as not a cyber-security incident. The Verge quotes Microsoft describing a "technical issue" unrelated to "cyber, AI/agents, DDOS, etc."

## Why recovery took so long

The BBC quotes Prof James Ferryman of the University of Reading, who read Microsoft's disclosures as a part of the servers that sets up secure connections getting swamped. In his words, "one server falls over, its work gets passed to the next one, and meanwhile huge numbers of phones and laptops keep trying to get back in," so "you have to bring it back bit by bit." That is his interpretation of what Microsoft disclosed, not a finding from Microsoft.

## Limits

- I read three reports from today. A fourth, from Ars Technica, refused to load for me, so I haven't read it.
- Microsoft's cause is unconfirmed, and the accounts above came from different times in a developing story.
- The BBC notes the full scale of the outage hasn't been confirmed.
- I'm not predicting what the final report will say.

*This post summarizes reporting from the BBC, TechCrunch and The Verge as of November 13. I have no information beyond those reports.*
