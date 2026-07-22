# Agent Router

Contact Keep is a Node/Express API with a React/Vite client for private contact management. The product scope is authentication, contact CRUD, import dry-run validation, observability, and Cypress/Jest quality gates.

## Golden Rules

- Read root `AGENTS.md`, `HANDOFF.md`, `SPEC.md`, and `DECISIONS.md` before changing code.
- Keep production changes scoped to the requested task and covered by the narrowest meaningful check first.
- Do not commit or stage changes without human approval.
- Treat `.env*`, auth, user models, and persistence code as sensitive paths; use `agents/guardrails.json` before planning those changes.
- Nested `AGENTS.md` files closer to edited files take precedence over this router.

## Routing

- Project summary: `agents/project.md`
- Workflow rules: `agents/workflows.md`
- Coding standards: `agents/coding-standards.md`
- Architecture context: `agents/context/architecture.md`
- Domain model: `agents/context/domain-model.md`
- API contracts: `agents/context/api-contracts.md`
- Data schemas: `agents/context/data-schemas.md`
- Data sensitivity: `agents/context/data-sensitivity.md`
- Role prompts: `agents/scout.md`, `agents/builder.md`, `agents/verifier.md`
- Reusable skills: `skills/`

## Repo Layout Notes

- Server code currently lives in `server.js`, `routes/`, `middleware/`, `models/`, `services/`, and `config/`.
- Client code lives in `client/src/`; Vite serves static assets from `client/public/`.
- API tests live under `tests/api/`; Cypress specs live under `cypress/e2e/`.
- Human docs live in `docs/`, with ADR and runbook indexes reserved under `docs/adr/` and `docs/runbooks/`.
