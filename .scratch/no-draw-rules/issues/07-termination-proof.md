# Termination proof

Type: task
Status: resolved
Blocked by: 05

## Question

Using the checker, verify the termination argument: from every reachable full board with no line, does some RNG outcome give one player a forced win (e.g. a keepable fork)? Equivalently: under win-seeking play, is the probability of non-termination 0 from every state? If not, name the failing states — the rule needs a change.

## Answer

Holds. All 64 reachable full boards with no line have a positive probability that the removal roll gives some player a forced win before the board can fill again; the minimum is 81.25% (e.g. XOX/OXO/OXO). Between two full boards play is bounded (removals only shrink the board, placements only grow it), so an infinite game needs infinitely many removal phases, each ending the game with probability >= 0.8125 when the favoured player takes the forced win. P(no end after n phases) <= 0.1875^n -> 0. A legal loop still exists (checker finds a 5-state cycle), which is the documented limitation.
