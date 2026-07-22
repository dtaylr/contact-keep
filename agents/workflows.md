# Workflows

## Before Editing

- Read `HANDOFF.md`, `SPEC.md`, `DECISIONS.md`, and the relevant files in scope.
- Search with `rg`, including hidden paths when checking CI or tooling references.
- Preserve user changes already present in the worktree.

## During Implementation

- Keep diffs small and task-focused.
- Update docs when command names, behavior, or operational workflows change.
- Add or update tests when behavior changes.
- Record out-of-scope ideas in `PARKING_LOT.md`.

## Verification

- Run the narrowest meaningful command first.
- Run `npm run local:check` when behavior or quality gate wiring changes.
- Run Cypress tag or browser scripts when the changed path affects E2E workflows.
- Do not stage or commit without explicit human approval.
