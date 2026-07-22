---
name: fullstack-execution
description: Production engineering standards for Contact Keep. Use when building features, writing API routes, changing auth, or modifying database access.
user-invocable: false
---

# Fullstack Execution Standards

## Stack

- Express API with Mongoose models.
- React client with Context API and Axios.
- MongoDB for persistence.
- Cypress and Jest/Supertest for verification.

## API Routes

- Validate all request bodies server-side.
- Require auth for contact mutations and reads.
- Enforce contact ownership before update or delete.
- Return safe error payloads without stack traces.
- Keep response shapes stable and covered by tests.

## Database

- Use Mongoose models for reads and writes.
- Avoid exposing password hashes or internal fields in API responses.
- Prefer explicit field updates over passing request bodies through directly.
- Add indexes when query patterns require them.

## Client

- Keep auth token handling centralized.
- Surface loading, empty, validation, and API error states.
- Use stable selectors for E2E coverage.
- Do not send analytics payloads containing secrets, passwords, or full contact records.

## Architecture Rules

- No unnecessary dependencies.
- Prefer small helpers over broad rewrites.
- Security-sensitive changes need negative tests.
- Major dependency migrations happen after the test gate is stable.
