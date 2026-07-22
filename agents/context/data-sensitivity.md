# Data Sensitivity

## Sensitive Values

- Passwords
- JWTs and auth headers
- User emails when not necessary for the assertion
- Full contact records and private contact details
- Real `.env` values

## Rules

- Never echo real secrets or private values into logs, docs, plans, fixtures, or analytics assertions.
- Use synthetic fixture data only.
- Analytics payloads may include opaque IDs, event names, timestamps, and coarse metadata, but not credentials or full contact details.
- Treat `.env*`, auth middleware, user routes, and user models as guarded paths.
