# Analytics Test Checklist

Analytics for this repo must be privacy-safe and testable without a production vendor.

## Event Contract

| Event | Trigger | Required payload |
| --- | --- | --- |
| `auth_register_success` | Registration succeeds | `userId`, `timestamp` |
| `auth_login_success` | Login succeeds | `userId`, `timestamp` |
| `contact_created` | Contact save succeeds | `contactId`, `type`, `timestamp` |
| `contact_updated` | Contact update succeeds | `contactId`, `changedFields`, `timestamp` |
| `contact_deleted` | Contact delete succeeds | `contactId`, `timestamp` |
| `contact_filter_used` | Filter input changes from empty | `queryLength`, `timestamp` |

## Required Assertions

- Event fires once per successful action.
- Failed actions do not emit success events.
- Payload does not include passwords, auth tokens, full names, email addresses, or phone numbers.
- Tests use a stub adapter, not a real network analytics destination.
