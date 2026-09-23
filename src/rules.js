// Pure rules engine for No-Draw Tic-Tac-Toe. Shared by the browser UI and
// the Node checker, so the checker verifies the exact rules people play.
// States are plain objects; every transition returns a new state.

export const EMPTY = 0;
export const X = 1;
export const O = 2;

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const MIN_TOTAL = 2;
export const MAX_TOTAL = 5;

export class RuleError extends Error {}

export function opponent(player) {
  return player === X ? O : X;
}

export function hasLine(board, player) {
  return LINES.some((line) => line.every((cell) => board[cell] === player));
}

export function isFull(board) {
  return board.every((cell) => cell !== EMPTY);
}

// phase: 'place'  — toMove places on an empty cell
//        'roll'   — board full, no line; awaiting the removal roll. toMove is
//                   the first remover (the player who did not place last)
//        'remove' — toMove removes `left` more pieces; then the other player
//                   removes `next` pieces
//        'over'   — winner is set
export function newGame() {
  return { board: Array(9).fill(EMPTY), phase: 'place', toMove: X, left: 0, next: 0, winner: null };
}

export function place(state, cell) {
  if (state.phase !== 'place') throw new RuleError(`cannot place during ${state.phase}`);
  if (state.board[cell] !== EMPTY) throw new RuleError(`cell ${cell} is occupied`);
  const board = state.board.slice();
  board[cell] = state.toMove;
  if (hasLine(board, state.toMove)) {
    return { board, phase: 'over', toMove: state.toMove, left: 0, next: 0, winner: state.toMove };
  }
  const phase = isFull(board) ? 'roll' : 'place';
  return { board, phase, toMove: opponent(state.toMove), left: 0, next: 0, winner: null };
}

// total: pieces to remove this phase (MIN_TOTAL..MAX_TOTAL).
// share: how many of them the first remover takes (0..total); the other
// player removes the rest.
export function startRemoval(state, total, share) {
  if (state.phase !== 'roll') throw new RuleError(`cannot roll during ${state.phase}`);
  if (!(total >= MIN_TOTAL && total <= MAX_TOTAL)) throw new RuleError(`bad total ${total}`);
  if (!(share >= 0 && share <= total)) throw new RuleError(`bad share ${share}`);
  const first = state.toMove;
  if (share === 0) {
    return { ...state, phase: 'remove', toMove: opponent(first), left: total, next: 0 };
  }
  return { ...state, phase: 'remove', toMove: first, left: share, next: total - share };
}

export function removePiece(state, cell) {
  if (state.phase !== 'remove') throw new RuleError(`cannot remove during ${state.phase}`);
  if (state.board[cell] === EMPTY) throw new RuleError(`cell ${cell} is empty`);
  const board = state.board.slice();
  board[cell] = EMPTY;
  const left = state.left - 1;
  if (left > 0) return { ...state, board, left };
  if (state.next > 0) {
    return { ...state, board, toMove: opponent(state.toMove), left: state.next, next: 0 };
  }
  // Placement resumes with the opponent of whoever removed the last piece.
  return { board, phase: 'place', toMove: opponent(state.toMove), left: 0, next: 0, winner: null };
}

// Uniform removal roll. rng returns a float in [0, 1).
export function rollRemoval(rng = Math.random) {
  const total = MIN_TOTAL + Math.floor(rng() * (MAX_TOTAL - MIN_TOTAL + 1));
  const share = Math.floor(rng() * (total + 1));
  return { total, share };
}

// Every (total, share) outcome with its probability; used by the checker.
export function removalOutcomes() {
  const outcomes = [];
  const totals = MAX_TOTAL - MIN_TOTAL + 1;
  for (let total = MIN_TOTAL; total <= MAX_TOTAL; total++) {
    for (let share = 0; share <= total; share++) {
      outcomes.push({ total, share, p: 1 / totals / (total + 1) });
    }
  }
  return outcomes;
}

export function legalCells(state) {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    const occupied = state.board[i] !== EMPTY;
    if ((state.phase === 'place' && !occupied) || (state.phase === 'remove' && occupied)) cells.push(i);
  }
  return cells;
}
