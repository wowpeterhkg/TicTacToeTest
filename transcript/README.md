# Transcript

## Tools and models

| Tool | Model | Use |
|---|---|---|
| Claude Code (Claude desktop app, Code tab, Windows 11) | Claude Opus 5.5 (`claude-opus-5-5`) | All design discussion, code, docs, commits |
| Claude Code built-in browser pane | — | Manual verification of the UI under `python -m http.server` |

Skills invoked: `mattpocock-skills:wayfinder` (v1.2.3), which charted decisions as local markdown tickets in `.scratch/no-draw-rules/` using the plugin's local-markdown tracker convention.

## Session files

One continuous Claude Code session, id `003bf556-a987-4e1d-b17d-0c20e8ec8ab3`. Claude Code writes it to
`~/.claude/projects/C--Users-wowpeter-Documents-GitHub-CXFOP-TicTacToeTest/003bf556-a987-4e1d-b17d-0c20e8ec8ab3.jsonl`.

| File | Covers |
|---|---|
| `session-01-003bf556-charting.jsonl` | The same session file, re-copied at phase boundaries. Git history holds each snapshot: commit `d1261ae` = brief analysis and rule design (charting); later commits = checker, UI, docs. The final commit holds the complete session. |

The file is copied byte-for-byte (`.gitattributes` marks `transcript/*.jsonl -text` so Git does not rewrite line endings). It was scanned for credential patterns before each commit. The only hits were a placeholder `POSTGRES_PASSWORD` value from an example in the global CLAUDE.md and the scan command itself.

## Configuration that shaped the model

In the repo:
- `.claude/launch.json` — dev-server config for the browser pane (`python -m http.server 8765`).
- `.agent/context/tech-stack.md` — written during the session, required by the global rules.

Outside the repo (loaded into every session on this machine):
- `~/.claude/CLAUDE.md` — global behaviour and engineering rules (one-step-at-a-time, pushback, git ceiling, Corridor plan analysis).
- `~/.claude/rules/airules-*.md`, `~/.claude/rules/github-issues-plane.md` — house rules (auto-loaded).
- `~/.claude/settings.json` — enabled plugins (`corridor`, `andrej-karpathy-skills`, `mattpocock-skills`) and the `airules` SessionStart hook.
- `~/.local/bin/airules-hook-session-start.cmd` — SessionStart hook; it injected the "offer `airules init`" reminder.
- Corridor plugin `hooks/hooks.json` — SessionStart, UserPromptSubmit, PreToolUse (MCP), PostToolUse (Write/Edit), Stop hooks. The Corridor MCP server itself failed to connect this session ("MCP is not enabled for this user"), so the global rule to run `analyzePlan` could not be followed.
- `mattpocock-skills` `wayfinder/SKILL.md` and `setup-matt-pocock-skills/issue-tracker-local.md`.
- MCP server configuration in `~/.claude.json`.

**Captured in `config/`:** the agent's own attempt to copy these (with MCP env/header values redacted) was blocked by Claude Code's auto-mode safety classifier, first when reading `~/.claude.json` and then when copying global config into the repo. The attempts and denials are in the session file. The author then copied them by hand with a PowerShell command the agent supplied (the first two attempts failed on shell mismatch, bash syntax in `cmd`; also in the session). The agent scanned and read every file before commit; the only credential-like strings are placeholder values in example snippets inside `CLAUDE.md`.

- `config/global/` — `CLAUDE.md`, `settings.json`, `rules/*.md` (path-scoped rules load only when matching files are touched; `airules-tests.md` loaded when `tests/` was edited), `hooks/airules-hook-session-start.cmd`.
- `config/plugins/` — `wayfinder-SKILL.md`, `corridor-hooks.json`.

**Still not captured:** MCP server configuration from `~/.claude.json` (the file also holds account data; it needs manual redaction).

## Known gaps

- The session was not compacted, so the JSONL is complete up to the last copy. Anything after the final copy (including the turn that made it) is not included.
- Hidden system prompt and tool definitions are not in the JSONL; only what Claude Code records.
