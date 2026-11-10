---
title: "LLMs are moving Postgres questions out of public channels"
description: "A summary of depesz's look at PostgreSQL mailing list traffic: more bug reports, fewer general questions, and a quieter community."
pubDate: 'Nov 09 2026 14:00'
imageTag: 'Postgres'
---

Hubert "depesz" Lubaczewski noticed something in the PostgreSQL mailing lists and decided to count it. His [post](https://www.depesz.com/2026/11/09/what-llms-do-to-postgresql-and-dbas/) is short, and its charts carry most of the data, so this summary sticks to what he says in the text.

## What prompted it

He started from the discussion about why so many features were reverted from PostgreSQL 19. While reading posts and talking to people, he noticed more email on the `pgsql-bugs` list and less on `pgsql-general`, and gathered list statistics going back to the start of 2024.

## What he found

- **pgsql-hackers:** very busy, with a recent uptick in new threads. Total emails per week are roughly stable.
- **pgsql-bugs:** reports of new bugs went up sometime between May and September. Zooming in on 2026, he describes a non-trivial increase since mid-July.
- **pgsql-general:** "WAY fewer" mails.
- **Slack and Discord:** discussions there are "almost gone", with a couple of messages a week at most.
- **IRC:** also down, from an average of 5,900 messages a month in 2024, to about 3,200 a month in 2025, to about 700 a month recently. He still finds it more active than Discord or Slack.
- **explain.depesz.com:** traffic has dropped significantly.

## His explanation

He says he "blames" LLMs, and he is explicit that this is his reading rather than something the data proves. LLMs help more people research, and find, bugs, which would explain the rise in `-bugs`. They also answer questions that people used to post to `-general`, Slack, Discord or IRC, since a good-enough answer arrives in about five minutes without risking an unfriendly reply or no reply.

On the drop in explain.depesz.com traffic, he allows that some of it is people moving to other visualizers such as explain.dalibo.com. He suspects most of it is people asking a machine to "make this query run faster" without reading the plan themselves.

## Limits

This is one person's reading of list volumes. Correlation is all he offers: the data shows when traffic changed, not why. Mailing-list counts also don't say whether the new `-bugs` reports are valid bugs or how many are duplicates. The post doesn't claim either.

## What I'd take from it

If public channels get quieter, the record of what people got stuck on and how others solved it grows more slowly. That is a worry depesz himself voices at the end, saying the change makes him curious and a bit worried about the future. For anyone who maintains a project or runs a community, the `-bugs` number is the one to watch, because that is where the extra load lands.

*This post summarizes the source article. I haven't independently checked the list statistics.*

Source: [What LLMs do to PostgreSQL and DBAs](https://www.depesz.com/2026/11/09/what-llms-do-to-postgresql-and-dbas/), depesz, Nov 9 2026.
