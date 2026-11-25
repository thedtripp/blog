---
title: "Lambda's 30-minute timeout doubles your concurrency math"
description: "AWS raised the Lambda timeout from 15 to 30 minutes with no opt-in and no new pricing. The same request rate now needs twice the concurrency, and your queue settings have to keep up."
pubDate: 'Nov 25 2026 13:00'
imageHeadline: '30-minute Lambda needs 2x concurrency'
imageTag: 'AWS Lambda'
imageExpression: 'point'
---

AWS has doubled the maximum timeout of on-demand Lambda Event Functions from 15 to 30 minutes, in all commercial regions, at standard pricing and without an opt-in. [InfoQ's write-up](https://www.infoq.com/news/2026/11/aws-lambda-30-minute-timeout/) (Nov 25) covers the change and the checks AWS and others say to run before you raise the number.

## What changed

The 15-minute ceiling had stood since 2018. Lambda launched with 60 seconds in 2014 and moved to five minutes in 2015. The new limit applies to synchronous, asynchronous and event source mapping invocations. It is a per-function configuration change, and Lambda rejects any value above 1,800 seconds:

```
aws lambda update-function-configuration \
    --function-name my-demo-function \
    --timeout 1800
```

It is one of three shapes Lambda took this year. Per InfoQ, Web Functions keep 15 minutes, Lambda MicroVMs allow eight hours, and Lambda Managed Instances give synchronous invocations 30 minutes while asynchronous ones keep the 90 minutes introduced in September. AWS names agentic AI requests that chain model and tool calls, media transcoding, Monte Carlo simulations and report generation as workloads that outgrew 15 minutes.

## Check capacity first

The authors of the AWS announcement say concurrency equals requests per second multiplied by average duration in seconds. At the same request rate, a function that runs 30 minutes instead of 15 needs twice the concurrency. Their example: 1 request per second at 30 minutes each needs 1,800 concurrent executions.

## The settings around the function

- An SQS queue's visibility timeout has to be at least six times the function timeout, which means three hours at 30 minutes.
- Kinesis and DynamoDB Streams read one batch per shard at a time, so a slow function slows the shard.
- Amazon MQ, DocumentDB and Kafka mappings created before November 19 stay at 14 minutes.
- A NAT gateway still drops idle connections after 350 seconds.
- The Init phase keeps its 10-second limit.

Independent AWS practitioner Wibo van der Sluis tested the SQS rule in eu-west-1. He raised a function to 1,800 seconds behind a queue with a 90-minute visibility timeout, then lowered the queue to 60 seconds. Both changes were accepted with the mapping still enabled, while a new mapping from the same queue was refused. So the check exists, but only at creation, and he did not test exactly where the line sits, so the six-times rule is guidance you enforce yourself. He also points out that an asynchronous function which times out three times has run for 90 minutes before the event reaches a dead-letter queue, and concludes that 30 minutes is the wrong fix for slow code behind an API.

## Mixed reactions

AWS Serverless Hero Luc van Donkersgoed wrote: "Hell froze over. AWS Lambda now supports 30-minute timeouts. I am not sure how I feel about this." Former AWS employee Magnus Eriksson says Lambda "is anyhow quite expensive per CPU second compared to EC2" and would still reserve it for short-lived spiky loads. A Reddit commenter says a 30-minute run bills for the full duration at your configured memory, and that Step Functions with Fargate or ECS is still usually cleaner for multi-step or long-running work. Branch Insurance CTO Joseph Emison reads the move as a response to Cloud Run, which allows 60 minutes per request. InfoQ says AWS hasn't said whether the limit will move again.

## What the article doesn't say

- It gives no cost comparison between Lambda at 30 minutes and Fargate, ECS or EC2.
- The six-times SQS rule and the 1,800-concurrency example are AWS's guidance. The one test cited is a single practitioner's, in one region.
- Much of the discussion is commentary and opinion, not measurement.

What I'd take from it: raising the timeout is one line, but the concurrency and queue settings it affects are not.

*This post summarizes the linked InfoQ article. The author hasn't run this change.*
