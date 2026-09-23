// Browser UI. All rule logic lives in rules.js; this file only renders
// state and turns clicks into rule transitions.
import {
  X, O, EMPTY, LINES, newGame, place, startRemoval, removePiece, rollRemoval,
} from './rules.js';

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const rollBtn = document.getElementById('roll');
const rollResultEl = document.getElementById('roll-result');
const logEl = document.getElementById('log');

const name = (p) => (p === X ? 'X' : 'O');

let state;

const cells = Array.from({ length: 9 }, (_, i) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cell';
  btn.setAttribute('aria-label', `cell ${i + 1}`);
  btn.addEventListener('click', () => onCell(i));
  boardEl.appendChild(btn);
  return btn;
});

function log(text) {
  const li = document.createElement('li');
  li.textContent = text;
  logEl.appendChild(li);
}

function onCell(i) {
  const mover = state.toMove;
  if (state.phase === 'place') {
    state = place(state, i);
    log(`${name(mover)} places at ${i + 1}`);
  } else if (state.phase === 'remove') {
    const removed = name(state.board[i]);
    state = removePiece(state, i);
    log(`${name(mover)} removes ${removed} at ${i + 1}`);
  }
  render();
}

function onRoll() {
  const { total, share } = rollRemoval();
  const first = state.toMove;
  const second = first === X ? O : X;
  rollResultEl.textContent =
    `Rolled: remove ${total}. ${name(first)} removes ${share}, ${name(second)} removes ${total - share}.`;
  log(`Board full, no line. Roll: total ${total}; ${name(first)} ${share}, ${name(second)} ${total - share}`);
  state = startRemoval(state, total, share);
  render();
}

function winningLine() {
  return LINES.find((line) => line.every((c) => state.board[c] === state.winner)) ?? [];
}

function statusText() {
  switch (state.phase) {
    case 'place':
      return `${name(state.toMove)} to place.`;
    case 'roll':
      return `Board full with no line. Roll to start the removal phase (${name(state.toMove)} removes first).`;
    case 'remove': {
      const then = state.next > 0 ? ` Then ${name(state.toMove === X ? O : X)} removes ${state.next}.` : '';
      return `${name(state.toMove)}: remove ${state.left} more piece${state.left === 1 ? '' : 's'} (either colour).${then}`;
    }
    case 'over':
      return `${name(state.winner)} wins!`;
    default:
      return '';
  }
}

function render() {
  const win = state.phase === 'over' ? winningLine() : [];
  cells.forEach((btn, i) => {
    const v = state.board[i];
    btn.textContent = v === EMPTY ? '' : name(v);
    const clickable = (state.phase === 'place' && v === EMPTY) || (state.phase === 'remove' && v !== EMPTY);
    btn.disabled = !clickable;
    btn.classList.toggle('removable', state.phase === 'remove' && v !== EMPTY);
    btn.classList.toggle('win', win.includes(i));
  });
  statusEl.textContent = statusText();
  rollBtn.hidden = state.phase !== 'roll';
}

function reset() {
  state = newGame();
  logEl.textContent = '';
  rollResultEl.textContent = '';
  render();
}

rollBtn.addEventListener('click', onRoll);
document.getElementById('new-game').addEventListener('click', reset);
reset();
