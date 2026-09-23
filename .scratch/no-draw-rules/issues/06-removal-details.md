# Removal details

Type: grilling
Status: resolved
Blocked by:

## Question

Pin the exact split mechanics of the removal phase:

- Range of the first remover's split roll: 0..total? Does the second remover take the remainder, or roll again?
- If rolls may be 0 and rolls repeat until the total is spent, the phase itself can loop — how is that prevented?
- Distribution of each roll (uniform?) and how it maps to physical dice for a printed `RULES.md`.
- Can a removal phase remove a piece that was just placed? Any cell restrictions?

## Comments

- Split mechanics: option A chosen. First remover rolls a share uniform over 0..total; second remover takes the remainder. Exactly two rolls per phase; no zero-roll loop. Rejected: repeated capped rolls (zero rolls can loop), coin per piece (extreme splits 1/32, slower termination).
- Constraints: all five proposed defaults accepted.

## Answer

Removal phase, triggered when a placement fills the board without a line:

1. Roll the total T, uniform over 2..5.
2. The first remover is the player who did not place the last piece. They roll their share S, uniform over 0..T. The second remover's share is T - S. Exactly two rolls per phase.
3. Each player must remove exactly their share (no passing, no partial removal). The first remover removes all of their share, then the second remover removes all of theirs.
4. Any piece of either colour may be removed, including the piece just placed. No cell is protected.
5. Removed cells are open for placement immediately, by either player.
6. Placement resumes with the opponent of whoever removed the last piece (if S = T, that is the first remover's opponent).
7. Lines are checked only after a placement; removal cannot create a line.

Physical-dice mapping for a printed copy stays in the map's fog (RULES.md wording); the browser uses a uniform RNG directly.
