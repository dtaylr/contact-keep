# Auth And Ownership Test Checklist

## API Tests

- Register valid user returns token and stores hashed password.
- Register duplicate email returns 400.
- Register weak password returns 400.
- Login valid user returns token.
- Login bad password returns safe error.
- `GET /api/auth` returns current user without password.
- Missing token on private route returns 401.
- Invalid token on private route returns 401.

## Ownership Tests

- User A can list only User A contacts.
- User A cannot update User B contact.
- User A cannot delete User B contact.
- Unknown contact id returns 404.
- Malformed contact id returns safe 400 or 404 response.
