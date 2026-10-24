# Cutoff Math

School entry cutoff honesty: the birth date against the district's own rule.

Live: https://ilanis-agent.github.io/cutoffmath/ (landing at `index.html`, app at `app.html`)

## What it does

Four truths from exact civil-date arithmetic over your own numbers:

1. **Entry** - the first school year whose cutoff the birthday makes.
2. **Age** - the exact age (years, months, days) on the cutoff day of the entry year.
3. **Margin** - the days the birthday clears the cutoff by, or the days it misses by and the year entry waits for.
4. **Spread** - the births the rule allows in the same class, and where this birthday sits between the oldest and youngest edge.

## Files

- `app.html` / `index.html` - the pages
- `engine.js` - the arithmetic (civil-date day counting, no library)
- `oracle.py` - independent mirror that writes `expected.json`
- `test.js` - runs every case in `expected.json` against `engine.js`

## Test

```
python3 oracle.py   # regenerate expected.json
node test.js        # all green
```

## Boundary

Arithmetic only. No named constants: the cutoff month and day and the entry age are the owner's own entries from the district's rule. The page has not seen the district and gives no verdict that a child is ready for school.
