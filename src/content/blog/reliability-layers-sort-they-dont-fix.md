---
title: "Stacking LLM checks sorted answers. It fixed almost none."
description: 'An InfoQ test of six reliability layers around an LLM found they ranked answers by trust but corrected almost nothing, and why yield matters next to accuracy.'
pubDate: 'Nov 10 2026 09:00'
imageTag: 'LLM reliability'
heroImage: '../../assets/post-images/reliability-layers-sort-they-dont-fix.png'
imageTheme: 'purple'
---

A common plan for making an LLM dependable is to wrap it in checks: validate the output, let the model correct itself, vote across samples, add a judge, send the rest to a person. The assumption is that each layer catches errors the earlier ones missed, so accuracy climbs with every layer. A new [InfoQ article](https://www.infoq.com/articles/llm-reliability-layers-limits-accuracy/) by Pushpdeep Mishra and Wejdan Bagais tested that assumption and reports that it did not hold.

## The setup

The authors used CADEC, a corpus of 1,250 forum posts about two drugs, where every adverse reaction is marked as a span of text and given a SNOMED CT code. That gave them a gold answer for every mention, so they could score each layer's verdicts instead of trusting them. The model never writes a code. It quotes the reaction, a retriever with no language model in it offers a menu of 20 candidate concepts, and the model picks one.

Before any layer, the model was right about one answer in three, yet reported full confidence on two-thirds of its answers.

## What the layers did

- **Vocabulary check (free).** It rejects codes that don't exist or spans not in the post, and accepts spans whose words match a concept name. It changed no answers. It only sorted them.
- **Self-correction.** It fires only on rejected answers, and it fired two or three times per run and corrected nothing.
- **Voting.** Three samples, majority wins, at 411,000 to 432,000 tokens per run. It changed about 27 codes a run, as many right-to-wrong as wrong-to-right, destroying 2 to 5 right answers. The article's explanation: the voter is the answerer, so a vote carries no information the answer lacked.
- **Second-model judge.** Shown only the span and a code, it barely told right from wrong. Shown the menu, it separated them 3.4 to 4.2 times better, but nothing downstream read its verdict.
- **Refusal.** Withhold what isn't endorsed. On the strictest setting, 21 to 23 percent of records passed at 0.74 to 0.82 accuracy.

## Accuracy flatters withholding

The authors' central point is that withholding is a layer's only lever. No rule can ship more than the 88 right answers the extractor found in the first run, so every accuracy gain is paid for in right answers held back. Moving to the strictest rule removed 128 errors but cost 49 right answers and sent 177 records to a person.

That is why they report yield, right answers as a share of all records, next to accuracy. Yield can't be improved by simply declining to answer.

## Ask the model to read, not to remember

When the model recalled SNOMED codes from memory, up to 38 percent of records came back null, and of the codes it committed to, 13 to 18 percent exist in no SNOMED release. Quoting a span and picking from a retrieved menu scored about ten times better. The article's rule: never ask the model for an identifier; let a lookup produce it.

## The ceiling is detection

Once a mention is found, the pipeline is fairly reliable: the right concept reached the menu for 93 percent of found spans and the model picked it 81 percent of the time. The loss comes earlier. Every layer checks an answer the extractor already gave, so none can find a mention it missed. On the held-out split the extractor found just over half the annotated mentions (detection F1 0.521), and that caps what any stack can reach.

## What the post doesn't settle

- The authors say CADEC has been public since 2015 and is almost certainly in the model's training data, and their judge model is small. They expect the comparisons between layers to hold, not the absolute numbers.
- The judge, the nesting of verdicts and the use of split votes for diagnosis were measured on CADEC only. The other findings were checked against seven more corpora, and the free vocabulary check reversed on place-name data, where it was right only 7 to 26 percent of the time.

What I'd take from it: if a layer only withholds, measure what it withholds, and look at the extractor's recall before buying more checks on top of it.

*This post summarizes the linked article. I haven't run the authors' code or reproduced their results.*
