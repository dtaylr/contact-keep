# Contact Keep

contact manager with token-based auth and private contact records per user.

## Stack

- Node.js, Express, MongoDB, Mongoose
- React, Vite, Context API, Axios
- Cypress for E2E coverage
- Jest/Supertest for API coverage

## Setup

1. Install server dependencies: `npm install`
2. Install client dependencies: `npm install --prefix client`
3. Create `config/default.json` or use environment variables from `.env.example`
4. Run locally: `npm run dev`

Use npm for both the root API and `client/` app. 

## Required Config

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: secret used to sign auth tokens
- `NODE_ENV`: `development`, `test`, or `production`

## Quality Commands

- `npm run cypress`: run API tests
- `npm run cypress:api`: run API contract tests
- `npm run cypress:e2e`: run Cypress headless
- `npm run cypress:e2e:chrome`: run Cypress headless in Chrome
- `npm run cypress:e2e:webkit`: run Cypress headless in WebKit
- `npm run cypress:e2e:smoke`: run Cypress tests tagged `@smoke`
- `npm run cypress:e2e:auth`: run Cypress tests tagged `@auth`
- `npm run cypress:e2e:contacts`: run Cypress tests tagged `@contacts`
- `npm run cypress:e2e:mobile`: run Cypress tests tagged `@mobile`
- `npm run structure:check`: validate required repo structure
- `npm run release:gate`: validate required release checks
- `npm run cypress:install`: install the local Cypress app binary
- `npm run build --prefix client`: build the React app
- `npm run local:check`: run release gate, API tests, production audits, and client build

## Testing Focus

Primary coverage protects registration, login, authenticated contact CRUD, import dry-run validation, ownership boundaries, validation errors, analytics events, and health checks.
