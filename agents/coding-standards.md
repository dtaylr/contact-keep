# Coding Standards

## JavaScript

- Match the existing CommonJS style on the server and ES module style in the client and Cypress specs.
- Prefer small, named helpers when logic is shared across routes, services, or tests.
- Keep validation and ownership checks close to API boundaries.
- Do not log tokens, passwords, or private contact details.

## Tests

- API tests live in `tests/api/` and use Jest/Supertest.
- Cypress specs live in `cypress/e2e/`; shared commands, mocks, page objects, and fixture data live under `cypress/support/` and `cypress/fixtures/`.
- Negative paths for auth, ownership, validation, and analytics privacy are required for relevant changes.

## Docs

- Human-facing process and QA docs live in `docs/`.
- Agent-facing intent and routing live in `agents/`.
- Architecture decisions should be added under `docs/adr/` when a change records a durable technical choice.
