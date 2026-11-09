---
title: 'I cut 3,824 items to 13 before a model read any of them'
description: 'A deterministic shortlist step for a feed reader: filter in plain code first, so the model only reads about 1,500 tokens.'
pubDate: 'Nov 10 2026'
---

I'm building a feed reader that finds things worth writing about. The first fetch returned 3,824 new items from over 100 feeds, grouped into five topics: infrastructure, cloud, data engineering, security, and AI.

Handing that to a model would cost more than anything it produced. So a plain-code step runs first and the model only sees what survives.

## The filters

No model is involved in any of these:

- **Age.** Anything older than two days is dropped.
- **Release tags.** Entries that are just a version tag (a `/releases` URL, or a title like `v3.6.2`) are dropped. They are useful as a reference, not as something to write about.
- **Low-value titles.** Webinars, hiring posts, sponsored posts, and newsletter roundups.
- **Relevance.** An item needs at least one hit from a hand-edited keyword list. A title hit counts double a summary hit, and matches are whole words or phrases.
- **Caps.** At most 2 items per source, 6 per topic, 20 overall.
- **Trimming.** Each summary is cut to 250 characters, HTML stripped, and tracking parameters removed from URLs.
- **A token budget.** If the file would exceed about 3,000 tokens, the lowest-ranked items are dropped until it fits.

The result for that first run: 13 items, about 1,500 tokens.

## The bug

I gave recent posts a small score bonus so fresh items would rank higher. My test list included an item titled "cooking tips". It got through on the bonus alone, with no keyword match at all.

The fix was to apply the recency bonus only to items that already matched a keyword:

```python
def score_item(item, keywords, today):
    score = keyword_score(item, keywords)
    age = _age_days(item, today)
    if score > 0 and age is not None:
        score += max(0, MAX_AGE_DAYS - age) * 0.5
    return score
```

A test now covers it.

## What this approach costs

- **The keyword list is hand-tuned and matches exact words.** A list entry of `outages` won't match "outage", so I had to add both forms. Some good items will be missed.
- **Token counts are an estimate** (characters divided by four), not a real tokenizer count.
- **It favors popular terms.** My first run leaned toward Postgres and AI agents because those words appear often. I tune the list by looking at how many items each keyword matches.

## Why do it this way

The shortlist is boring, testable code. When an item shows up, I can say exactly which rule let it in, and when something is missing I can see which rule dropped it. A model deciding relevance would be harder to inspect.

The model's job starts after that: it reads 13 items, I pick one or two, and only then does it read the full article.
