# Map: No-draw tic-tac-toe rule set

Label: wayfinder:map

## Destination

A locked rule set in `docs/RULES.md`, backed by a checker script that exhaustively verifies no reachable terminal state lacks a line, that play terminates with probability 1 under win-seeking play, and that reports P(X wins) under perfect play. Implementation of the game UI starts after this.

## Notes

- Source: `AI Dev Test - Candidate brief.pdf` (3x3, X/O alternating, no draw, always terminates; HTML/CSS/JS, no build step, Chrome only).
- Time box: 3 hours active work. Record overruns.
- Brief constraints override global house rules (no React/Vite, no backend, no 13-doc set).
- Skills for grilling tickets: `/grilling`, `/domain-modeling`.
- Premise: both players always try to win. Cooperative stalling is out of the design's guarantee.
- Recording: raw Claude Code JSONL copied into `transcript/` at phase boundaries (assumed; not yet explicitly confirmed by the user).

## Decisions so far

- [Fairness definition](issues/01-fairness-definition.md) — option B: balanced in practice, measured as P(X wins) under perfect play; no forced-win-by-construction.
- [Draw handling](issues/02-draw-handling.md) — no tiebreak of any kind; the only way to win is three in a line.
- [Removal rule](issues/03-removal-rule.md) — full board with no line triggers an RNG removal phase (total 2–5, split between players by RNG, either colour removable).
- [Termination reading](issues/04-termination-reading.md) — probabilistic: terminates with probability 1 under win-seeking play; strict bound rejected.
- [Removal details](issues/06-removal-details.md) — one split roll (share 0..T, remainder to the other), mandatory removal of any piece, freed cells open at once, next placer is the opponent of the last remover.

## Not yet specified

- Removal-phase UI: how the browser shows rolls, whose removal turn it is, and remaining count.
- `RULES.md` wording, including how to play from a printed copy with physical dice (e.g. 1d4+1 for the 2–5 total).
- Transcript export mechanics and the redacted config bundle for `transcript/`.

## Out of scope

- Computer opponent (brief: not scored).
- Visual polish, animation, responsive layout (brief: not scored).
