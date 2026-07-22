# QA Strategy

## Quality Goals

- Prove auth and contact ownership boundaries.
- Protect critical browser workflows.
- Keep tests deterministic and readable.
- Capture useful failure artifacts for fast triage.

## Test Layers

- API tests: route validation, auth, ownership, and response shape.
- E2E tests: registration, login, contact CRUD, filtering, and error states.
- Data validation tests: import dry-run reconciliation, duplicates, required fields, malformed payloads, and no-write behavior.
- Build check: Vite production build.
- Security checks: dependency audit and route hardening review.
- Release gate: machine-readable required checks with human signoff.

## Required Coverage

- Register with valid and invalid input.
- Login with valid and invalid credentials.
- Load authenticated user without exposing password.
- Create, edit, filter, and delete contact.
- Validate import samples without persisting contacts.
- Reject unauthenticated contact requests.
- Reject cross-user contact access.
- Verify health endpoint status.
- Verify analytics events are emitted once with expected payload shape.

## Current Commands

- `npm run cypress`
- `npm run build --prefix client`
- `npm run cypress:e2e:ci`
- `npm run cypress:e2e:ci:smoke`
- `npm run cypress:e2e:ci:auth`
- `npm run cypress:e2e:ci:contacts`
- `npm run cypress:e2e:ci:mobile`
- `npm run cypress:e2e:ci:chrome`
- `npm run cypress:e2e:ci:webkit`
- `npm run structure:check`
- `npm run release:gate`
- `npm audit`
- `npm audit --prefix client --omit=dev`
- `npm run local:check`

Run `npm run cypress:install` before local E2E execution if the Cypress app binary is missing from the machine cache.


## Verifier Gate

A separate verifier reviews:

- Changed conditionals and state transitions.
- Negative-path assertions.
- Test flake risk.
- Missing release blockers.
- Commands and evidence from the local test run.
