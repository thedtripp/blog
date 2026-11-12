---
title: "A nightly LLM batch job was paying for 24-hour capacity"
description: 'Walmart Global Tech says switching a nightly multi-agent inventory job from reserved PTUs to pay-as-you-go cut inference from about $100k a month to $10k.'
pubDate: 'Nov 10 2026 13:00'
imageHeadline: 'A nightly LLM job paid for 24 hours'
imageTag: 'LLM cost'
heroImage: '../../assets/post-images/nightly-batch-llm-paid-for-24-hours.png'
imageTheme: 'green'
imageExpression: 'facepalm'
---

Aditya Mulik of Walmart Global Tech describes a multi-agent LLM workflow that recommends inventory changes to store managers, in an [InfoQ talk with transcript](https://www.infoq.com/presentations/scaling-multi-agent-llm-batch/) from QCon AI. The architecture is ordinary. The failures and the bill are the useful part.

## What it does

Walmart already had time-series models that forecast demand from one to two years of sales history. They work for recurring events like Thanksgiving but not for surprises such as a storm or a competitor's flash sale. The team added a sequential chain of four agents: gather department context, merge it with past sales, ground the result against live signals like weather, and write a plain directive such as "increase apple stock 15% in produce ahead of the weekend." A store manager reviews each recommendation and can accept or override it. The talk calls that human step a feature, not a fallback.

A pilot of 10 to 15 stores looked good. Rolling out to roughly 4,700 stores as a nightly run surfaced four failures.

## Four failures at full scale

1. **Vague output that passed.** A recommendation said to raise "some stock" about 15% for produce items that sell well, with high confidence and no item. The fix was structured output with typed fields: SKU, item, department and adjustment.
2. **Valid JSON that was wrong.** The same item number appeared in two departments, so a Honeycrisp Apple was attached to auto parts. The schema couldn't catch it. The team added an MCP tool call that looks the item up in the right catalog and rejects anything that doesn't belong to that pipeline.
3. **Vanished output.** A database write timed out with a connection reset, and the store manager saw no recommendation, which could look like "nothing to do." The team moved from a sequential agent to a loop agent with a bounded number of retries.
4. **No visibility.** They added structured logging of retries, schema violations and latency, aiming for a 99 percent success rate.

## The bill

The team had reserved 400 provisioned throughput units (PTUs) for the foundation model, at about $100k to $120k a month. PTUs are reserved capacity held around the clock, but the job ran only overnight and served no live traffic. They considered cheaper or open-source models, fewer PTUs, or pay-as-you-go, and chose pay-as-you-go. It brought rate limits and latency, but the retry logic absorbed them, and the stores are closed while the job runs. Monthly cost fell from around $100k to about $10k, with the same model and the same tokens.

## What the talk doesn't say

- The cost figures are the speaker's, stated in a talk and not independently shown.
- Evals were not covered in the presentation. In the Q&A, Mulik said the team started with an MVP and added evals, grounding and governance iteratively.
- The retry loop wraps the whole workflow, and Mulik notes that this is not the most cost-efficient place for it; retries should sit where they are needed, and unbounded ones can burn tokens.
- There is no head-to-head accuracy comparison against the original forecasting models in the talk.

What I'd take from it: price the capacity model against the actual duty cycle of the job, and treat schema validity as the floor, with semantic checks against a source of truth on top.

*This post summarizes the linked talk transcript. I haven't built or run this system.*
