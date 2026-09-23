# Rule checker

Type: task
Status: resolved
Blocked by: 06

## Question

Build a Node script (no dependencies) that enumerates the full state graph of the rule set — placement and removal phases, all RNG outcomes — and reports:

- any reachable terminal state without a line (must be zero);
- reachable cycles (expected to exist; documents the known limitation);
- P(X wins) under perfect play, via expectimax / value iteration over RNG outcomes;
- P(X wins) under uniform-random play, for comparison against perfect play.

## Answer

Built `tools/checker.js` on top of the shared engine `src/rules.js` (so it verifies the code the browser runs). `npm run check` output:

```
States: 55962 (place 19638, full-board 64, remove 28976, won 7284)
No draw: stuck non-terminal states = 0, terminal states without a winning line = 0
Cycle exists: yes (length 5, e.g. through XOX/OXX/OXO)
Full boards with no line: 64; with zero forced-win probability: 0
Min P(removal roll gives someone a forced win) over full boards: 81.2500% at XOX/OXO/OXO
P(X wins), perfect play: 50.0000% (stalling counted against X) .. 50.0000% (stalling counted for X); sweeps 35/39
P(X wins), random play: 65.2339%; P(O wins): 34.7661%; sum 100.0000%
```

Regression-locked by `tests/rules.test.js`.
