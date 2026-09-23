# No-Draw Tic-Tac-Toe — Rules

Two players, X and O, on a 3×3 grid. X moves first. Players alternate.

## Goal

Get three of your marks in a row — horizontally, vertically, or diagonally. That is the only way to win. There are no draws and no tiebreaks.

## Placing

On your turn, put one of your marks in any empty cell. If that gives you three in a row, you win immediately and the game ends.

## When the board fills up

If a placement fills the last empty cell and nobody has three in a row, play does not stop. A **removal phase** starts:

1. **Roll the total.** Roll to find how many marks will be removed this phase: 2, 3, 4 or 5, each equally likely.
2. **Roll the split.** The *first remover* is the player who did **not** place the last mark. Roll to find how many of the total the first remover takes: any number from 0 up to the total, each equally likely. The other player takes the rest.
3. **Remove.** The first remover removes their share, one mark at a time. Then the other player removes theirs. You may remove **any** mark — yours or your opponent's, including the mark just placed. You must remove exactly your share; you cannot pass. If your share is 0, you remove nothing.
4. **Resume placing.** The next player to place is the opponent of whoever removed the last mark. Emptied cells can be used straight away by either player.

Removing marks never wins or loses the game by itself. Wins are checked only after a placement.

If the board fills again with no line, start another removal phase. There is no limit on the number of removal phases.

## Playing on paper with dice

The browser version rolls for you. On paper, use these:

**Total** — roll one four-sided die (d4) and add 1: result 2–5.

**Split** — the first remover's share, by total:

| Total | Roll | Share |
|---|---|---|
| 2 | one d6 | 1–2 → 0, 3–4 → 1, 5–6 → 2 |
| 3 | one d4 | result − 1 (0–3) |
| 4 | one d6, re-roll any 6 | result − 1 (0–4) |
| 5 | one d6 | result − 1 (0–5) |

## Worked example

```
X O X
X O O      X has just placed the 9th mark. No line: removal phase.
O X X
```

- Total roll: 3. First remover is O (O did not place last). Split roll: O takes 2, X takes 1.
- O removes the X in the top-left corner and the X in the bottom-right corner.
- X removes the O in the middle.
- X removed the last mark, so **O places next**.

## Running the browser version

From the repository root:

```
python -m http.server
```

Open <http://localhost:8000> in Chrome. Click a cell to place or, during a removal phase, to remove (removable cells are shaded red). Click **Roll removal** when the board fills.
