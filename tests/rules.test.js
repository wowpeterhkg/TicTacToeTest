import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  X, O, EMPTY, newGame, place, startRemoval, removePiece, rollRemoval, RuleError,
} from '../src/rules.js';
import { runChecks } from '../tools/checker.js';

const parse = (text) => [...text.replace(/\//g, '')].map((c) => (c === 'X' ? X : c === 'O' ? O : EMPTY));

function playAll(state, cells) {
  return cells.reduce((s, c) => place(s, c), state);
}

test('three in a line wins immediately', () => {
  const s = playAll(newGame(), [0, 3, 1, 4, 2]);
  assert.equal(s.phase, 'over');
  assert.equal(s.winner, X);
});

test('full board with no line goes to roll; first remover is the non-placer', () => {
  // X O X / X O O / O X X  — X places last (9th move)
  const s = playAll(newGame(), [0, 1, 2, 4, 3, 5, 7, 6, 8]);
  assert.deepEqual(s.board, parse('XOX/XOO/OXX'));
  assert.equal(s.phase, 'roll');
  assert.equal(s.toMove, O);
});

test('share 0: second remover takes the whole total, first remover places next', () => {
  let s = { board: parse('XOX/XOO/OXX'), phase: 'roll', toMove: O, left: 0, next: 0, winner: null };
  s = startRemoval(s, 2, 0);
  assert.equal(s.toMove, X);
  assert.equal(s.left, 2);
  s = removePiece(removePiece(s, 1), 4);
  assert.equal(s.phase, 'place');
  assert.equal(s.toMove, O);
});

test('share = total: first remover takes all, second player places next', () => {
  let s = { board: parse('XOX/XOO/OXX'), phase: 'roll', toMove: O, left: 0, next: 0, winner: null };
  s = startRemoval(s, 3, 3);
  s = removePiece(removePiece(removePiece(s, 0), 2), 3);
  assert.equal(s.phase, 'place');
  assert.equal(s.toMove, X);
});

test('split: first remover then second remover, pieces of either colour', () => {
  let s = { board: parse('XOX/XOO/OXX'), phase: 'roll', toMove: O, left: 0, next: 0, winner: null };
  s = startRemoval(s, 4, 1);
  assert.deepEqual([s.toMove, s.left, s.next], [O, 1, 3]);
  s = removePiece(s, 1); // O removes its own piece
  assert.deepEqual([s.toMove, s.left, s.next], [X, 3, 0]);
  s = removePiece(removePiece(removePiece(s, 0), 4), 8);
  assert.equal(s.phase, 'place');
  assert.equal(s.toMove, O);
});

test('the loop from the design discussion is legal (known limitation)', () => {
  let s = { board: parse('XOX/XOO/OXX'), phase: 'roll', toMove: O, left: 0, next: 0, winner: null };
  s = startRemoval(s, 2, 1);
  s = removePiece(s, 0); // O removes X at 0
  s = removePiece(s, 1); // X removes O at 1
  s = place(s, 0); // O
  s = place(s, 1); // X
  assert.deepEqual(s.board, parse('OXX/XOO/OXX'));
  assert.equal(s.phase, 'roll');
  assert.equal(s.toMove, O);
});

test('illegal actions are rejected', () => {
  const s = place(newGame(), 4);
  assert.throws(() => place(s, 4), RuleError);
  assert.throws(() => removePiece(s, 4), RuleError);
  assert.throws(() => startRemoval(s, 2, 1), RuleError);
  const roll = { board: parse('XOX/XOO/OXX'), phase: 'roll', toMove: O, left: 0, next: 0, winner: null };
  assert.throws(() => startRemoval(roll, 1, 0), RuleError);
  assert.throws(() => startRemoval(roll, 6, 0), RuleError);
  assert.throws(() => startRemoval(roll, 3, 4), RuleError);
  const removing = startRemoval(roll, 2, 2);
  assert.throws(() => place(removing, 0), RuleError);
});

test('rollRemoval stays in range at the RNG extremes', () => {
  assert.deepEqual(rollRemoval(() => 0), { total: 2, share: 0 });
  assert.deepEqual(rollRemoval(() => 0.999999), { total: 5, share: 5 });
});

test('exhaustive check: no draw, termination argument holds, fairness', () => {
  const r = runChecks();
  assert.equal(r.noDraw.stuck, 0, 'a non-terminal state has no legal move');
  assert.equal(r.noDraw.badTerminal, 0, 'a terminal state lacks a winning line');
  assert.equal(r.termination.zero, 0, 'a full board gives no roll a forced win');
  assert.ok(r.termination.minP > 0);
  assert.ok(Math.abs(r.optimalLow.value - r.optimalHigh.value) < 1e-9, 'game value depends on how stalling is scored');
  assert.ok(Math.abs(r.optimalLow.value - 0.5) < 1e-9, 'perfect-play P(X wins) is not 50%');
});
