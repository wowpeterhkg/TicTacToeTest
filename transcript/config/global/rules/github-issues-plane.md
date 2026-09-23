# GitHub issues — Plane.so sync label

Every GitHub issue created on the user's behalf — by any skill (wayfinder maps
and tickets, to-tickets, to-spec, triage) or ad hoc via `gh issue create` —
must carry the label `plane`. Plane.so's GitHub integration filters on that
label; an unlabelled issue never syncs.

- Add `--label plane` to every `gh issue create`.
- If the label is missing from the repo, create it first:
  `gh label create plane --color 3F76FF --description "Sync to Plane.so" --force`
- If an issue was created without it, fix it: `gh issue edit <n> --add-label plane`.
- Applies to issues only — not PRs, not comments.
