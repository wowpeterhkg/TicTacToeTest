# Design — No-Draw Tic-Tac-Toe

Rules: [RULES.md](RULES.md). Decision log (wayfinder map): [.scratch/no-draw-rules/map.md](../.scratch/no-draw-rules/map.md). Every claim below marked *checked* is produced by `npm run check` and locked by `npm test` (Node 18+, no dependencies; Node is needed only to verify, not to play).

## 1. Reading of the brief

| Brief says | Gap | Resolution |
|---|---|---|
| "Recognisably tic-tac-toe: 3×3, two players, X and O, alternating turns" | Is removing marks still tic-tac-toe? Must *every* action alternate? | Kept: 3×3, X/O, three-in-a-row wins, alternating **placement**. Added one mechanic — a removal phase — only when the classic game would have drawn. A game that ends before the board fills is exactly classic tic-tac-toe. Interpretation: alternation applies to placements within a placement run; the removal phase has its own turn order (see §5, *double placement*). |
| "No draw: no terminal state in which neither player has won" | Does a tiebreak count as a win? | No tiebreak of any kind. The only way to win is three in a line. |
| "Always terminates: no line of play continues indefinitely" | Bounded length, or ends with probability 1? | **Probabilistic**, under the premise that both players try to win: the game ends with probability 1. The literal reading (every line of play is finite) is **not** met — see §4.2 and §5. This was a deliberate, argued choice, not an oversight. |
| (silent) | Fairness | Not required by the brief; chosen as a goal anyway. Definition: P(X wins) under perfect play should be close to 50%. |
| "Rules are yours to invent" | Randomness allowed? | Yes — nothing forbids it, and it is what makes fairness achievable (§3). |

## 2. Rule sets considered and rejected

| Candidate | Why rejected |
|---|---|
| **Full-board tiebreak** (e.g. full board with no line → O wins) | Trivially terminates (≤ 9 moves) and trivially has no draw, but the "win" is not three in a line, and classic tic-tac-toe is a draw under perfect play, so it hands one side a forced win. |
| **Line-count scoring** on a full board | Ties still occur; needs its own tiebreak. Same objection as above. |
| **Sliding / three-piece** (each player keeps only 3 marks; oldest disappears) | Has no full board, but play can cycle forever; fixing that needs a move cap, and a cap needs a winner at the cap — a tiebreak again. |
| **Last placer removes 2–3 marks of their choice** | X always places the 9th mark, so X always gets the power (unfair); and the board can refill with no line indefinitely. |
| **Alternating one-at-a-time removal, RNG count** | Fixes the X bias but still loops. |
| **Repeated capped split rolls** (each player rolls 0..remaining until spent) | Zero rolls can repeat forever *inside* the removal phase. Replaced by a single split roll. |
| **Coin per removed mark** decides who removes it | Paper-friendly, but an all-to-one-player split of 5 is 1/32 vs 1/6, so decisive phases are rarer. |
| **Strict (Hex-style) bound** — some quantity strictly decreases so every game is finite | Would meet the literal "always terminates". Rejected in discussion on the premise that players try to win; recorded as the stricter alternative (§5). |

**Why randomness at all.** Zermelo's theorem: a finite, deterministic, perfect-information two-player game with no draws has a forced win for one side. Any deterministic no-draw variant is therefore "solved" in favour of X or O, and on a 3×3 board the solution is a few seconds of search away. A chance element removes that guarantee and lets the value sit at 50%.

## 3. The chosen rule

Classic play; when a placement fills the board with no line: roll a total T ∈ {2..5}; the player who did not place last (first remover) rolls a share S ∈ {0..T}; they remove S marks of either colour, the other player removes T − S; placement resumes with the opponent of whoever removed last. Full text in [RULES.md](RULES.md).

## 4. Arguments

The checker (`tools/checker.js`) builds the complete reachable state graph from the same `src/rules.js` the browser runs — placement states, full-board (roll) states with every (T, S) outcome weighted by probability, and each individual removal step.

```
States: 55962 (place 19638, full-board 64, remove 28976, won 7284)
No draw: stuck non-terminal states = 0, terminal states without a winning line = 0
Cycle exists: yes (length 5, e.g. through XOX/OXX/OXO)
Full boards with no line: 64; with zero forced-win probability: 0
Min P(removal roll gives someone a forced win) over full boards: 81.2500% at XOX/OXO/OXO
P(X wins), perfect play: 50.0000% (stalling counted against X) .. 50.0000% (stalling counted for X); sweeps 35/39
P(X wins), random play: 65.2339%; P(O wins): 34.7661%; sum 100.0000%
```

### 4.1 No draw (checked, exhaustive)

The game ends only when a placement completes a line, so every terminal state has a winner by construction. The remaining risk is a stuck state — a position with no legal action. There is none: during placement the board is never full (a full board moves to the roll), and a removal phase removes at most 5 of 9 marks, so a mark is always available to remove. The checker confirms 0 stuck states and 0 terminal states without a winning line across all 55,962 reachable states.

### 4.2 Termination (checked; probabilistic)

1. **Between two full boards, play is bounded.** A removal phase only shrinks the board; the placements after it only grow it. So from one full board to the next is at most 5 removals + 5 placements. An infinite game must therefore pass through infinitely many removal phases.
2. **Every removal phase has a large chance of ending the game.** For each of the 64 reachable full boards, the checker computes, over all (T, S) outcomes, the probability that the outcome gives *some* player a forced win before the board can fill again (e.g. a big share lets a player keep a fork of their own marks and clear its completion cells). The minimum over all 64 boards is **81.25%**; no board is 0.
3. **So, if players take forced wins**, P(game still running after n removal phases) ≤ 0.1875ⁿ → 0. The game ends with probability 1, and the expected number of removal phases is at most 1/0.8125 ≈ 1.23.

**What this does not prove.** A legal infinite line of play exists — the checker finds a 5-state cycle, and `tests/rules.test.js` replays one by hand (XOX/XOO/OXX → roll 2, split 1/1 → O removes an X, X removes an O → refill → another full board with no line). It needs both players to decline forced wins every time the dice offer one. The brief's literal "no line of play continues indefinitely" is therefore **not** satisfied; the design relies on the premise that players try to win.

### 4.3 Fairness (checked)

Value iteration over the full graph (X maximises P(X wins), O minimises; roll nodes average over outcomes) gives **P(X wins) = 50.0000%** under perfect play. It is computed twice — once scoring an endless game as a loss for X, once as a win — and both give 50%, so the value does not depend on how stalling is scored. Full-board values range from 33.5% to 66.5%, so the 50% is not an artefact of every position being even; perfect play in the opening steers to boards where the two effects cancel. Under uniform-random play X wins 65.2% (the classic first-move advantage survives among weak players).

## 5. Known limitations and unfinished items

- **Literal termination not met.** See §4.2. Fix if required: add a strictly decreasing quantity, e.g. a cap on removal phases after which the next full board's removal roll is fixed at 5 and all to the first remover — the checker would need to confirm that still yields a forced win from all 64 boards.
- **Double placement.** If the first remover's share is the whole total, the same player who placed the 9th mark places again after the removal phase (they are the opponent of the last remover). Consistent with the stated rule, but a reader of "alternating turns" might object.
- **Paper dice for total 4** use "re-roll any 6", which is itself unbounded (probability 0 of repeating forever). The browser uses a uniform RNG and is unaffected.
- **RNG** is `Math.random` — not seedable, so a browser game cannot be replayed exactly. The move log records every roll.
- **Fairness target** (ticket 08) — the acceptable band was not formally agreed; the measured value is 50.0000%.
- **UI**: no undo, no computer opponent, minimal styling/accessibility (all out of scope per the brief).

## 6. Process notes

- Worked with Claude Code (single continuous session) using the `wayfinder` skill to chart decisions as local markdown tickets under `.scratch/no-draw-rules/`.
- Several rule proposals were rejected in conversation *by argument*, before the checker existed; the checker then confirmed the chosen rule. See `transcript/`.
- Session start to UI committed: about 52 minutes of the 3-hour box.
