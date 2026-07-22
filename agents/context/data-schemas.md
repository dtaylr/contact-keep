# Data Schemas

## Mongoose Models

- `models/User.js` defines the persisted user shape.
- `models/Contact.js` defines the persisted contact shape and ownership relationship.

## Client/Test Data

- Cypress fixtures live under `cypress/fixtures/`.
- Cypress runtime token helpers live in `cypress/support/data/auth.js` so token values are assembled during tests rather than stored in JSON fixtures.

Schema-changing work should update the relevant model, API tests, Cypress mocks, and docs together.
