# Domain Model

## User

Users authenticate with an email and password. Passwords are hashed and must never be returned in API responses, fixtures, logs, analytics payloads, or generated docs.

## Contact

Contacts belong to exactly one user. Contact access and mutation must enforce ownership, including reads, updates, deletes, and filtered lists.

## Import Dry Run

Import dry runs validate sample contact rows and return a reconciliation report. They report valid rows, invalid rows, duplicates, missing required fields, and summary counts without saving data.

## Analytics

Local analytics events may describe successful actions and high-level metadata, but must not include passwords, tokens, full contact records, or private contact values.
