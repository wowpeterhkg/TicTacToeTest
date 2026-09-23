# Tech stack

Constrained by the candidate brief: HTML, CSS, JavaScript; runs in current Chrome; no build step, no backend, no network calls. Served with `python -m http.server` from the repo root.

| Area | Choice | Notes |
|---|---|---|
| Game | Vanilla ES modules (`src/`) | Loaded directly by the browser; no framework, no bundler |
| Rules engine | `src/rules.js` | Pure functions; shared by the browser and the checker |
| Checker | Node (built-ins only), `tools/checker.js` | Exhaustive state-graph analysis; Node 18+ |
| Tests | `node:test` + `node:assert` | `npm test`; no test framework dependency |
| Serving | Python 3 `http.server` | Dev and demo only |

Dependencies: none. `package.json` exists only for `"type": "module"` and script aliases; there is nothing to install.

The house default stack (React, Vite, NestJS, Postgres) does not apply: the brief forbids a build step and a backend.
