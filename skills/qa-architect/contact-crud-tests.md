# Contact CRUD Test Checklist

## API Tests

- Create contact with valid name/email/type returns stored contact.
- Create contact without name returns 400.
- Create contact with invalid type returns 400.
- Update contact changes only allowed fields.
- Delete contact removes it for the owner.
- List contacts sorts newest first.

## E2E Tests

- Authenticated user creates a contact from the form.
- User edits an existing contact.
- User filters contacts by name or email.
- User clears the filter and sees the full list again.
- User deletes a contact and it disappears.
- Empty state appears when no contacts exist.
