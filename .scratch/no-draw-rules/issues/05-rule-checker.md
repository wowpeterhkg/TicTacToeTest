# Rule checker

Type: task
Status: open
Blocked by: 06

## Question

Build a Node script (no dependencies) that enumerates the full state graph of the rule set — placement and removal phases, all RNG outcomes — and reports:

- any reachable terminal state without a line (must be zero);
- reachable cycles (expected to exist; documents the known limitation);
- P(X wins) under perfect play, via expectimax / value iteration over RNG outcomes;
- P(X wins) under uniform-random play, for comparison against perfect play.
