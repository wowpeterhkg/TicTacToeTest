// Exhaustive checker for No-Draw Tic-Tac-Toe.
// Builds the complete reachable state graph from src/rules.js and verifies:
//   1. No draw: every non-terminal state has a legal move, and every terminal
//      state has a winner with three in a line.
//   2. Cycles: whether an infinite line of play exists (expected: yes).
//   3. Termination under win-seeking play: for every reachable full board,
//      the probability that the removal roll hands some player a forced win
//      before the board can fill again. If the minimum is > 0, the chance of
//      play continuing forever is 0 when players take forced wins.
//   4. Fairness: P(X wins) under perfect play and under uniform-random play.
// Usage: node tools/checker.js

import {
  X, O, newGame, place, startRemoval, removePiece, removalOutcomes, legalCells, hasLine,
} from '../src/rules.js';
import { pathToFileURL } from 'node:url';

const PHASES = { place: 0, roll: 1, remove: 2, over: 3 };

function key(s) {
  let board = 0;
  for (let i = 8; i >= 0; i--) board = board * 3 + s.board[i];
  return (((board * 4 + PHASES[s.phase]) * 3 + s.toMove) * 6 + s.left) * 6 + s.next;
}

export function buildGraph() {
  const ids = new Map();
  const states = [];
  const succ = []; // per node: array of { to, p } (p only for roll nodes)
  const queue = [];

  const intern = (s) => {
    const k = key(s);
    let id = ids.get(k);
    if (id === undefined) {
      id = states.length;
      ids.set(k, id);
      states.push(s);
      queue.push(id);
    }
    return id;
  };

  intern(newGame());
  for (let head = 0; head < queue.length; head++) {
    const id = queue[head];
    const s = states[id];
    const edges = [];
    if (s.phase === 'place') {
      for (const c of legalCells(s)) edges.push({ to: intern(place(s, c)) });
    } else if (s.phase === 'remove') {
      for (const c of legalCells(s)) edges.push({ to: intern(removePiece(s, c)) });
    } else if (s.phase === 'roll') {
      for (const o of removalOutcomes()) edges.push({ to: intern(startRemoval(s, o.total, o.share)), p: o.p });
    }
    succ[id] = edges;
  }
  return { states, succ };
}

function checkNoDraw({ states, succ }) {
  const stuck = [];
  const badTerminal = [];
  for (let id = 0; id < states.length; id++) {
    const s = states[id];
    if (s.phase === 'over') {
      if (!(s.winner === X || s.winner === O) || !hasLine(s.board, s.winner)) badTerminal.push(id);
    } else if (succ[id].length === 0) {
      stuck.push(id);
    }
  }
  return { stuck: stuck.length, badTerminal: badTerminal.length };
}

// Iterative DFS; returns one cycle as a list of state ids, or null.
function findCycle({ states, succ }) {
  const color = new Uint8Array(states.length); // 0 new, 1 on stack, 2 done
  const parent = new Int32Array(states.length).fill(-1);
  const iter = new Int32Array(states.length);
  const stack = [0];
  color[0] = 1;
  while (stack.length) {
    const u = stack[stack.length - 1];
    if (iter[u] < succ[u].length) {
      const v = succ[u][iter[u]++].to;
      if (color[v] === 0) {
        color[v] = 1;
        parent[v] = u;
        stack.push(v);
      } else if (color[v] === 1) {
        const cycle = [v];
        for (let w = u; w !== v; w = parent[w]) cycle.push(w);
        return cycle.reverse();
      }
    } else {
      color[u] = 2;
      stack.pop();
    }
  }
  return null;
}

// canForce[q][id]: player q can force a win from id before the next full
// board (next 'roll' state). Between two roll states the graph is acyclic:
// removals only shrink the board, placements only grow it.
function forcedWinTables({ states, succ }) {
  const tables = {};
  for (const q of [X, O]) {
    const memo = new Int8Array(states.length).fill(-1);
    const solve = (root) => {
      const stack = [root];
      while (stack.length) {
        const id = stack[stack.length - 1];
        if (memo[id] !== -1) { stack.pop(); continue; }
        const s = states[id];
        if (s.phase === 'over') { memo[id] = s.winner === q ? 1 : 0; stack.pop(); continue; }
        if (s.phase === 'roll') { memo[id] = 0; stack.pop(); continue; }
        const pending = succ[id].filter((e) => memo[e.to] === -1);
        if (pending.length) { for (const e of pending) stack.push(e.to); continue; }
        const vals = succ[id].map((e) => memo[e.to]);
        memo[id] = (s.toMove === q ? vals.some((v) => v === 1) : vals.every((v) => v === 1)) ? 1 : 0;
        stack.pop();
      }
      return memo[root];
    };
    tables[q] = solve;
  }
  return tables;
}

function checkTermination(graph) {
  const { states, succ } = graph;
  const force = forcedWinTables(graph);
  let rollStates = 0;
  let minP = Infinity;
  let minExample = null;
  let zero = 0;
  for (let id = 0; id < states.length; id++) {
    if (states[id].phase !== 'roll') continue;
    rollStates++;
    let p = 0;
    for (const e of succ[id]) if (force[X](e.to) || force[O](e.to)) p += e.p;
    if (p === 0) zero++;
    if (p < minP) { minP = p; minExample = states[id]; }
  }
  return { rollStates, minP, zero, minExample };
}

// Value iteration for P(X wins). mode 'optimal': X maximises, O minimises.
// mode 'random': uniform over legal moves. `init` is the value assumed for
// non-terminating play (0 = counts as not-X-win, 1 = counts as X-win).
function valueIteration({ states, succ }, mode, winner, init) {
  const n = states.length;
  const v = new Float64Array(n);
  for (let id = 0; id < n; id++) {
    const s = states[id];
    v[id] = s.phase === 'over' ? (s.winner === winner ? 1 : 0) : init;
  }
  const maximiser = winner;
  let delta = 1;
  let sweeps = 0;
  while (delta > 1e-12 && sweeps < 20000) {
    delta = 0;
    sweeps++;
    for (let id = n - 1; id >= 0; id--) {
      const s = states[id];
      if (s.phase === 'over') continue;
      const edges = succ[id];
      let val;
      if (s.phase === 'roll') {
        val = 0;
        for (const e of edges) val += e.p * v[e.to];
      } else if (mode === 'random') {
        val = 0;
        for (const e of edges) val += v[e.to];
        val /= edges.length;
      } else if (s.toMove === maximiser) {
        val = -1;
        for (const e of edges) if (v[e.to] > val) val = v[e.to];
      } else {
        val = 2;
        for (const e of edges) if (v[e.to] < val) val = v[e.to];
      }
      const d = Math.abs(val - v[id]);
      if (d > delta) delta = d;
      v[id] = val;
    }
  }
  return { value: v[0], values: v, sweeps, residual: delta };
}

function boardText(board) {
  const ch = (c) => (c === X ? 'X' : c === O ? 'O' : '.');
  return [0, 3, 6].map((r) => board.slice(r, r + 3).map(ch).join('')).join('/');
}

export function runChecks() {
  const graph = buildGraph();
  const counts = { place: 0, roll: 0, remove: 0, over: 0 };
  for (const s of graph.states) counts[s.phase]++;
  const noDraw = checkNoDraw(graph);
  const cycle = findCycle(graph);
  const termination = checkTermination(graph);
  const optimalLow = valueIteration(graph, 'optimal', X, 0);
  const optimalHigh = valueIteration(graph, 'optimal', X, 1);
  const randomX = valueIteration(graph, 'random', X, 0);
  const randomO = valueIteration(graph, 'random', O, 0);
  return { graph, counts, noDraw, cycle, termination, optimalLow, optimalHigh, randomX, randomO };
}

function report(r) {
  const pct = (x) => `${(x * 100).toFixed(4)}%`;
  const lines = [];
  lines.push(`States: ${r.graph.states.length} (place ${r.counts.place}, full-board ${r.counts.roll}, remove ${r.counts.remove}, won ${r.counts.over})`);
  lines.push(`No draw: stuck non-terminal states = ${r.noDraw.stuck}, terminal states without a winning line = ${r.noDraw.badTerminal}`);
  lines.push(`Cycle exists: ${r.cycle ? `yes (length ${r.cycle.length}, e.g. through ${boardText(r.graph.states[r.cycle[0]].board)})` : 'no'}`);
  lines.push(`Full boards with no line: ${r.termination.rollStates}; with zero forced-win probability: ${r.termination.zero}`);
  lines.push(`Min P(removal roll gives someone a forced win) over full boards: ${pct(r.termination.minP)} at ${boardText(r.termination.minExample.board)}`);
  lines.push(`P(X wins), perfect play: ${pct(r.optimalLow.value)} (stalling counted against X) .. ${pct(r.optimalHigh.value)} (stalling counted for X); sweeps ${r.optimalLow.sweeps}/${r.optimalHigh.sweeps}`);
  lines.push(`P(X wins), random play: ${pct(r.randomX.value)}; P(O wins): ${pct(r.randomO.value)}; sum ${pct(r.randomX.value + r.randomO.value)}`);
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(report(runChecks()));
}
