# Cypress Architecture

## Structure

- `cypress/e2e/user-journeys/` contains narrative journeys through the app.
- `cypress/e2e/flows/` contains focused specs by product surface.
- `cypress/support/pages/` owns page object models and selectors.
- `cypress/support/mocks/` owns API intercepts and mutable mock state.
- `cypress/fixtures/` owns safe test data only. Token values are not fixtures.

## Devices

Every E2E spec runs through the shared device matrix in
`cypress/support/viewports.js`:

- desktop: `macbook-13`
- tablet: `ipad-2`, landscape
- iPhone: `iphone-x`
- Android: `samsung-s10`

Specs use `context('<device> viewport')` blocks so failures clearly identify the
affected layout. Tests set the active device with `cy.useDevice(device)`.

## State And Auth

Tests stay isolated and seed the browser state they need in each test. Authenticated
flows use `cy.visitAuthenticated()`, which writes a mock token before app load.
Login and registration journeys still exercise the UI because those flows are the
behavior under test.

Global setup and teardown live in `cypress/support/hooks.js`. The support file
registers root-level `before`, `beforeEach`, `afterEach`, and `after` hooks that
clear cookies, local storage, session storage, and local analytics state.

The token helper lives in `cypress/support/data/auth.js` and assembles a mock
token at runtime. It is intentionally not stored as JSON fixture data and does not
use `Cypress.env()` because this project sets `allowCypressEnv: false`.

## Selectors, Aliases, And Retry-ability

Page objects target stable `data-cy` attributes. Specs use route aliases such as
`@login`, `@getContacts`, and `@importDryRun` for request/response assertions.
Assertions prefer retryable `.should(...)` chains instead of fixed waits.

Page objects are selector-only. Repeated workflows, such as logging in through
the UI, filling forms, authenticated visits, and import submissions, live in
`cypress/support/commands.js`.

## Tags And Browsers

The suite uses the official `@cypress/grep` plugin. Specs and tests are tagged
with groups such as `@critical`, `@smoke`, `@auth`, `@contacts`, `@import`,
`@analytics`, `@desktop`, `@tablet`, `@iphone`, and `@android`.

Useful commands:

- `npm run cypress:e2e:ci`: Electron full suite.
- `npm run cypress:e2e:ci:critical`: Electron critical tagged tests.
- `npm run cypress:e2e:ci:chrome:critical`: Chrome critical tagged tests.
- `npm run cypress:e2e:ci:chrome:smoke`: Chrome smoke tagged tests.
- `npm run cypress:e2e:ci:firefox:critical`: Firefox critical tagged tests.
- `npm run cypress:e2e:ci:edge:critical`: Edge critical tagged tests.
- `npm run cypress:e2e:ci:webkit:critical`: WebKit critical tagged tests.
- `npm run cypress:e2e:ci:webkit:smoke`: WebKit smoke tagged tests.
- `npm run cypress:e2e:ci:auth`: Auth tagged tests.
- `npm run cypress:e2e:ci:contacts`: Contacts tagged tests.
- `npm run cypress:e2e:ci:import`: Import tagged tests.
- `npm run cypress:e2e:ci:analytics`: Analytics tagged tests.
- `npm run cypress:e2e:ci:desktop`: Desktop viewport tagged tests.
- `npm run cypress:e2e:ci:mobile`: Mobile viewport tagged tests.

Additional browsers must be installed on the machine or CI image. Cypress WebKit
support is experimental and uses `playwright-webkit`; this gives Safari-engine
coverage for desktop and iOS-like viewport contexts (`macbook-13`, `ipad-2`, and
`iphone-x`) without requiring native Safari automation.

CI runs the full Electron suite in the main job. Cross-browser critical tests run
in a separate matrix job for Chrome and WebKit, allowing those browser checks to
execute concurrently with the main CI thread. Cypress Cloud `--parallel` is not
enabled because it requires project recording configuration and a record key.

## AI Test Generation

For this project, the committed suite follows the generate-once workflow: review generated code,
keep stable selectors, and commit deterministic Cypress commands. No live `cy.prompt()` calls committed because the local CI gate should not depend on
Cypress Cloud or self-healing behavior unless that is explicitly adopted.
