---
title: "Datasentinel's AI assistant reads your Postgres metrics, not your database"
description: "Datasentinel 2026.10 adds an AI Connector that lets an assistant analyze PostgreSQL monitoring data. The security model is the interesting part, and so is what still reaches the model."
pubDate: 'Nov 15 2026 13:00'
imageHeadline: 'AI reads Postgres metrics, not the database'
imageTag: 'PostgreSQL'
imageExpression: 'thinking'
---

On Nov 15, 2026, Datasentinel [announced release 2026.10](https://www.postgresql.org/about/news/datasentinel-202610-released-with-ai-connector-3400/) of its commercial PostgreSQL monitoring platform. The headline feature is AI Connector, which lets an AI assistant answer questions like "why was the orders database slow at 9:00 this morning?" from the metrics Datasentinel already collects. Everything below is from the vendor's own announcement.

## How it is put together

AI Connector combines two pieces. An MCP server gives the assistant access to Datasentinel metrics, and a Skill guides how the assistant analyzes them. The announcement says it works with Claude, ChatGPT, Gemini, Microsoft Copilot and GitHub Copilot, among others, and that you choose the model behind them. It is an add-on enabled by a licence option.

The announcement lists four kinds of questions:

- **Past performance:** what happened on one instance or a group, from slow queries to locks.
- **Live troubleshooting:** running sessions, who is blocking whom, and how a query would be executed.
- **Comparisons:** two periods, instances or applications, such as before and after a deployment.
- **Recommendations:** advice on queries, indexes, settings and maintenance, based on your own metrics.

One example question: "Compare prod-eu-1 today 08:00-10:00 vs yesterday same window: did it regress?" The announcement says answers come ordered by impact, each with the evidence behind it and a next step.

## The security model

The line the announcement leads with is that opening monitoring data to an AI assistant does not open the databases. It gives four reasons:

1. **Sign-in.** Users sign in through Datasentinel's login page using OAuth 2.1. The assistant gets a token, never a password or database credential.
2. **Same rights as the web interface.** Users see only the instances their role allows, and live analysis needs a dedicated privilege.
3. **No direct database access.** The assistant never connects to a database. Live checks are read-only and go through the Datasentinel agent, and execution plans are estimated without running the query.
4. **Audit.** Scripts and scheduled jobs use access tokens that can be revoked at any time, and sign-ins and token events are logged.

A new optional `datasentinel_analytics` function gives read-only access to planner statistics and execution plans. It requires Agent v4.0.0 or later.

## What still reaches the model

The same section says it plainly: metrics, SQL text, execution plans and object names reach the assistant and the LLM you choose. That is the part a team should read twice. Query text can contain table names, column names and sometimes literal values, and the announcement does not say whether it is masked before it leaves. The credential boundary is real, but the data boundary depends on which model you connect and what your policy allows.

## Other changes in 2026.10

The release also includes a more compact PDF report layout with wait events and blocking scenarios, a documentation MCP server, automatic purging of inactive instances, a single place to set query monitoring filters for agentless instances, and updated third-party dependencies to address known vulnerabilities.

## Limits

- This is a vendor announcement. It contains no benchmark, no customer result and no measure of how accurate the assistant's diagnoses are.
- The claims about access control and read-only behavior are the vendor's description. I have not tested any of them.
- Datasentinel offers a public sandbox with a shared, read-only account and a trial for your own instances, per the announcement.

*This post summarizes Datasentinel's announcement. I have not run the product.*
