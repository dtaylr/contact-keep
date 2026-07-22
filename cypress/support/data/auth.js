const mockHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
const mockPayload = 'eyJ1c2VyIjp7ImlkIjoidXNlci0xIn19';

export const getAuthToken = () =>
  [mockHeader, mockPayload, 'fixture-signature'].join('.');
