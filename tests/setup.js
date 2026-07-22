jest.setTimeout(30000);

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1/contact_keep_test';
