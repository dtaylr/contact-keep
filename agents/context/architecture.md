# Architecture

Contact Keep is a split web app with one Node/Express server and one React/Vite client.

## Runtime Flow

- `server.js` initializes Express middleware, API routes, security headers, logging, static client serving, and health behavior.
- `routes/` contains API route handlers for users, auth, and contacts.
- `middleware/` contains auth, error handling, rate limiting, and request logging.
- `models/` contains Mongoose models for users and contacts.
- `services/` contains domain services such as import dry-run reconciliation.
- `client/src/` contains the React app, context, utilities, styles, and components.

## Testing Flow

- Jest/Supertest tests exercise API behavior through `tests/api/`.
- Cypress E2E specs exercise browser flows through `cypress/e2e/`, using mocked API responses and shared support helpers.
- Release gate metadata lives in `quality/release-gate.json`.
