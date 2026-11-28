---
title: "AWS Account Access Manager: IAM roles with one federation point"
description: "AWS added Account Access Manager to assign workforce users and groups to existing IAM roles across an organization, keeping custom trust policies and per-user attribution."
pubDate: 'Nov 28 2026 13:00'
imageTag: 'AWS IAM'
imageHeadline: 'One federation point, existing IAM roles'
imageExpression: 'squint'
---

[InfoQ reports](https://www.infoq.com/news/2026/11/aws-centralized-workforce-access/) (Nov 28) that AWS introduced Account Access Manager, a way to centrally assign workforce users and groups to existing IAM roles across an organization. It keeps custom trust policies and ABAC configurations, and it improves individual identity attribution and auditability. The interesting part is which trade-off it is trying to remove.

## The two options before

Per the article, organizations had two ways to give workforce users access to AWS accounts:

- **Direct IAM role federation** gives flexibility through custom trust policies, tags, and paths, but you configure identity providers and manage access separately in each account.
- **IAM Identity Center** gives centralized federation and provisioning through permission sets, but can be restrictive when teams need account-specific roles or permissions.

AWS's own framing, quoted in the article, is that Account Access Manager "removes the trade-offs": the single federation point and identity propagation of Identity Center, with the flexibility of IAM roles.

## What it does

- Assigns users and groups to **existing IAM roles** across the organization, with support for custom trust policies and role paths.
- Can operate independently or alongside existing Identity Center permission sets, using the same users and groups.
- Propagates the individual user's identity into the IAM role session, so actions can be attributed to a specific user even when several people share a role.
- Adds a dedicated account-access API namespace, with separate IAM permissions and CloudTrail events for auditing assignments and related operations.

AWS recommends enabling it in the organization's management account, in the same Region as IAM Identity Center, and automating trust policy updates in role-creation pipelines.

## Migration and ecosystem

At launch AWS announced integrations with partners including Okta, Ping Identity, Cisco Duo, BeyondTrust, Britive, Sonrai Security, Apono, Lumos, C1.ai, and Pulumi, the last of which lets teams codify role assignments alongside the rest of their infrastructure as code. There's also an open source AAM Migration Tool that automates moving from Identity Center permission sets or SAML-based IAM federation. It covers identity and policy discovery, migration planning, IAM role creation, entitlement mapping, and CloudFormation template generation, through a browser UI or CLI.

The feature is available at no additional cost in all commercial regions.

## The fine print

One detail worth reading closely: Identity Center CLI commands such as `aws sso configure` are not supported for Account Access Manager assignments, and the article says to replace them with `aws login`. If your engineers' laptops and scripts depend on the SSO CLI flow, that's the first thing a migration touches.

## Limits

- The article is a news summary built from AWS's announcement and AWS-authored material. The claims about what the service does are AWS's own.
- InfoQ quotes Corey Quinn of The Duckbill Group on the downside: IAM, SSO, Identity Center, permission sets, and now a thing that works "alone or alongside" the others, so there's "no solution to fragmentation quite like adding more options."
- The article gives no migration timings, scale limits, or real-world results.

*This post summarizes the InfoQ article. I haven't tried Account Access Manager myself.*
