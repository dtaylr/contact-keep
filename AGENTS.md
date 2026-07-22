# Agent Operating Guide

## Source Of Truth

- Read `HANDOFF.md`, `SPEC.md`, and `DECISIONS.md` before changing code.
- For agent-facing routing and project context, read `agents/AGENTS.md`.
- Keep changes scoped to the active task.
- Use `PARKING_LOT.md` for good ideas outside current scope.

## Hard Rules

- Do not commit.
- Ask the human before staging changes with `git add`.
- Do not overwrite user changes.
- Prefer small, reviewable diffs.
- Run the narrowest meaningful test first, then the full local gate when behavior changes.
- Stop after three failed attempts at the same fix and record the blocker.

## Command Hygiene

- Skip generated folders: `node_modules`, `client/build`, coverage, Cypress videos, screenshots, and logs.
- Use `rg` for search.
- Cap unknown command output.

## Review Roles

- `scout`: read-only repo discovery and triage.
- `builder`: implements one scoped task.
- `verifier`: independently reviews tests, coverage, and release risk.

## Structure Checks

- Run `npm run structure:check` after changing repo layout, agent docs, CI, or release-gate wiring.
- Root `AGENTS.md` stays in place for tool compatibility; detailed agent context lives under `agents/`.
