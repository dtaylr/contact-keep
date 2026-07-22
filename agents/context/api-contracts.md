# API Contracts

Canonical behavior lives in the route handlers and Jest/Supertest assertions.

## Primary Routes

- `routes/users.js`: registration.
- `routes/auth.js`: login and current-user loading.
- `routes/contacts.js`: authenticated contact CRUD, filtering, and import dry-run behavior.

## Contract Tests

Use `tests/api/auth-contact.test.js` as the executable source for expected status codes, response shapes, validation failures, ownership checks, and health behavior.
