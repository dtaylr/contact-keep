# Security Policy

## Supported Scope

Security review covers the Contact Keep API, React client, authentication flow, contact ownership rules, dependency configuration, and CI/test automation.

## Reporting

Report issues privately to the repository owner. Include:

- Affected route, component, or dependency
- Steps to reproduce
- Expected and actual result
- Impact and suggested remediation

Do not include real credentials, production data, or third-party secrets in reports.

## Security Baseline

- Secrets stay out of git and are loaded through environment/config files.
- Authenticated contact routes must enforce per-user ownership.
- Login and registration routes should be rate-limited.
- Server responses should avoid stack traces and sensitive user fields.
- Dependency audits should be reviewed before release.
- CI must run API tests, E2E tests, and client build checks before merge.
