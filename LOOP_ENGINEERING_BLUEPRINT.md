# Contact Keep Engineering Loop

QA operating model for a small app: clear scope, automated verification, security checks, observability, and maker/checker review.

## Operating Rules

- `SPEC.md` defines current scope.
- `HANDOFF.md` records current state and known issues.
- `DECISIONS.md` records why architecture choices were made.
- `PARKING_LOT.md` holds ideas that are not in the active scope.
- No commit is made by an agent. Humans stage and commit after review.

## Standard Loop

1. Pick one task from `SPEC.md`.
2. Implement the smallest useful change.
3. Run targeted tests.
4. Run the broader local quality gate when behavior changes.
5. Ask a verifier agent to review coverage and release risk.
6. Ask the human to approve staging with `git add`.

## Release Gate

Nothing should be notes as 'done' unless all are true:

- API tests pass.
- E2E tests pass or have a documented environment blocker.
- Client build passes.
- Auth and contact ownership boundaries are covered.
- Security-sensitive changes have a negative test.
- `HANDOFF.md` is current.

## Automation Priorities

- CI runs API tests, Cypress E2E, and client build.
- Cypress captures screenshots/videos on failure.
- Health checks make runtime failures easy to detect.
- Analytics tests verify event names and payload shape without sending real user data.
