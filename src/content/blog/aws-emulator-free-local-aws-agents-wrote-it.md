---
title: "AWS now ships a free local emulator, and agents wrote all of it"
description: 'AWS Emulator, announced November 11, runs 200+ AWS services on your machine at no extra fee. AWS says agents wrote and tested all of its code, and it does not evaluate IAM policies.'
pubDate: 'Nov 12 2026 09:00'
imageHeadline: 'AWS Emulator: 200+ services, agent-built'
imageTag: 'Dev tools'
imageExpression: 'thinking'
---

On November 11, 2026, AWS announced AWS Emulator, a local emulator you run on your own machine. The [AWS News Blog announcement](https://aws.amazon.com/blogs/aws/test-your-applications-against-aws-locally-with-aws-emulator/) says the AWS CLI, the AWS SDKs and coding agents talk to it over a local HTTPS endpoint using the same AWS APIs they would use in the cloud. There is no additional service fee, and the source is on GitHub.

## What changes for a developer

A unit test that creates a DynamoDB table, writes an item and reads it back can run on a laptop without a deployment. You install an RPM or Debian package on Linux. On macOS and Windows you run it in Docker, and AWS says it doesn't publish a ready-made image. Simon Willison [noted](https://simonwillison.net/2026/Nov/11/aws-emulator/) that the Docker requirement is a drawback and that he hopes for a single binary.

Two details from the announcement matter for test suites:

- The emulator generates new credentials each time it starts, and its access key IDs start with `EMULATOR`. It rejects requests signed with any other keys.
- If the emulator hasn't implemented an operation, it returns HTTP 501, so a test fails right away instead of silently passing.

For Rust tests there is also an embedded mode that runs the emulator inside the test process, with its own state per instance so parallel tests don't share buckets or tables. The announcement says embedded mode is available for the AWS SDK for Rust.

## How AWS says it was built

In a [guest post on All Things Distributed](https://www.allthingsdistributed.com/2026/11/aws-emulator-and-the-engineers-job-when-agents-write-the-code.html), Swaminathan Sivasubramanian writes that all of the emulator's code was written and tested by agents. It is built from more than 400 API models covering more than 200 AWS services. The agents work from fidelity tests: end-to-end scenarios that are first corrected until they pass against real AWS, and then used as the target for the emulator. Simon Willison reports 29,684 commits in the first three weeks of the project.

AWS says it publishes a pass count per service with each release, in a form like "40 of 50", and that the fidelity test set is public, including tests that don't pass yet. AWS also warns that a score can go down when tests are added even while the emulator improves.

## What the sources don't say, and the limits

- **IAM is not evaluated.** The announcement says the emulator doesn't evaluate IAM policies or resource-based policies the way AWS does, so a request AWS would deny might succeed locally. AWS says not to use the emulator to test whether your application is secure.
- **Single account, no cross-Region behavior.** Each emulator acts as a single account, with no cross-account or cross-Region behavior.
- **Fidelity varies.** AWS says how closely it matches AWS varies by service and feature. The fidelity numbers are AWS's own measurements. I haven't seen the per-service scores, so I can't say how well your services are covered.
- **Telemetry.** By default the emulator sends anonymous usage and error data, and AWS says you can turn it off.

What I'd take from it: check the published fidelity score for the specific services you use before moving tests onto it, and keep a test pass against real AWS for anything that depends on permissions.

*This post summarizes the linked announcements as of November 12, 2026. I haven't installed or run the emulator.*
