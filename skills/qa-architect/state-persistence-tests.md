# State Persistence Test Checklist

## Required Coverage

- Auth token is stored after login/register.
- Auth token is removed on logout.
- Current user reloads after browser refresh when token is valid.
- Contacts reload after authenticated refresh.
- Contact filter does not permanently mutate the contact list.
- API error state is visible and can recover after a later successful request.

## Edge Cases

- Expired or malformed token clears auth state.
- Empty contact list shows a useful empty state.
- Failed update does not overwrite the last known good contact.
- Failed delete does not remove the contact from UI state.
