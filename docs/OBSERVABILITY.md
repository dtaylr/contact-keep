# Observability

## Runtime Signals

- `GET /api/health` reports service status.
- Request logging records method, route, status, and response time.
- Server errors return safe messages and log diagnostic details locally.

## QA Signals

- Cypress keeps screenshots and videos for failed runs.
- CI uploads failure artifacts.
- API tests assert error responses, not only status codes.
- GitHub Actions runs audits, API tests, client build, and Cypress E2E.
- Release gate validation keeps required checks explicit.

## Analytics

Analytics should be local-first in this repo:

- Track event names and payload shape in tests.
- Avoid sending secrets or full contact details.
- Keep vendor integration optional and isolated behind a small client adapter.
- Import dry-run analytics only records reconciliation counts.

## Self-Healing Boundaries

Self-healing means resilient automation and fast recovery signals:

- Stable selectors instead of brittle text-only selectors.
- Retries only for known transient E2E failures.
- Health checks for quick outage detection.
- Clear artifacts when tests fail.

Must not hide failing product behavior or silently relax assertions.
