# Fairness definition

Type: grilling
Status: resolved

## Question

What does "fair" mean for this variant, given that a deterministic, perfect-information, terminating, drawless game always has a forced win for one side (Zermelo)?

## Answer

Option B — balanced in practice. Adding RNG to the removal phase takes the game outside Zermelo's deterministic case, so fairness is measured as P(X wins) under perfect play (expectimax over RNG outcomes), computed by the checker. Rejected: A (coin toss for sides — honest but leaves a known forced win), C as a goal in itself (drifts from tic-tac-toe).
