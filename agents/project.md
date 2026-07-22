# Project

Contact Keep lets authenticated users manage private contact records.a Node/Express API, MongoDB/Mongoose persistence, JWT authentication, and a React/Vite client.

## Current Product Scope

- Register and log in users.
- Load the current authenticated user.
- Create, read, update, delete, and filter contacts.
- Prevent cross-user access to contact records.
- Validate contact import samples with a dry-run reconciliation report.
- Expose health and local analytics behavior without leaking secrets.

## Quality Bar

- API behavior is covered by Jest/Supertest tests.
- Critical browser workflows are covered by Cypress across desktop, tablet, and mobile viewport contexts.
- Release readiness is tracked in `quality/release-gate.json` and validated by scripts.
