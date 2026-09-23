# Termination reading

Type: grilling
Status: resolved

## Question

Does "always terminates" mean every line of play ends within a bound (strict), or that play ends with probability 1 (probabilistic)?

## Answer

Probabilistic, under the premise that both players always try to win.

Argument (to be verified): every removal phase has a non-zero chance of a roll (total 5, all to one player) that lets that player keep a fork and win by force, so the chance of play continuing forever is 0.

Known limitation, to state in `docs/DESIGN.md`: a legal loop exists (e.g. total 2 split 1/1, refilling to another full no-line board), so the brief's literal "no line of play continues indefinitely" holds only for win-seeking players. Rejected: strict bound (Hex-style guarantee) — would need a monotone mechanism the user judged unnecessary given the win-seeking premise.
