const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const Contact = require('../../models/Contact');
const User = require('../../models/User');

let mongoServer;

const userPayload = suffix => ({
  name: `Test User ${suffix}`,
  email: `user-${suffix}@example.com`,
  password: 'password123'
});

const registerUser = async suffix => {
  const res = await request(app)
    .post('/api/users')
    .send(userPayload(suffix))
    .expect(200);

  return res.body.token;
};

const createContact = async (token, overrides = {}) => {
  const res = await request(app)
    .post('/api/contacts')
    .set('x-auth-token', token)
    .send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '555-0100',
      type: 'professional',
      ...overrides
    })
    .expect(200);

  return res.body;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      launchTimeout: 60000
    }
  });
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await Contact.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('health', () => {
  test('returns service health', async () => {
    const res = await request(app).get('/api/health').expect(200);

    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'contact-keep'
    });
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('auth API', () => {
  test('registers a user and stores a hashed password', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(userPayload('register'))
      .expect(200);

    expect(res.body.token).toBeTruthy();

    const user = await User.findOne({ email: 'user-register@example.com' });
    expect(user.password).not.toBe('password123');
  });

  test('rejects duplicate registration', async () => {
    await registerUser('duplicate');

    const res = await request(app)
      .post('/api/users')
      .send(userPayload('duplicate'))
      .expect(400);

    expect(res.body.msg).toBe('User already exists');
  });

  test('rejects weak registration input', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: '', email: 'bad-email', password: '123' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Please add name' }),
        expect.objectContaining({ msg: 'Please include a valid email' }),
        expect.objectContaining({
          msg: 'Please enter a password with 6 or more characters'
        })
      ])
    );
  });

  test('logs in and loads current user without password', async () => {
    const token = await registerUser('login');

    const login = await request(app)
      .post('/api/auth')
      .send({ email: 'user-login@example.com', password: 'password123' })
      .expect(200);

    expect(login.body.token).toBeTruthy();

    const currentUser = await request(app)
      .get('/api/auth')
      .set('x-auth-token', token)
      .expect(200);

    expect(currentUser.body.email).toBe('user-login@example.com');
    expect(currentUser.body.password).toBeUndefined();
  });

  test('rejects bad credentials and invalid tokens safely', async () => {
    await registerUser('bad-login');

    const badLogin = await request(app)
      .post('/api/auth')
      .send({ email: 'user-bad-login@example.com', password: 'wrong-password' })
      .expect(400);

    expect(badLogin.body.msg).toBe('Invalid Credentials');

    const badToken = await request(app)
      .get('/api/auth')
      .set('x-auth-token', 'not-a-token')
      .expect(401);

    expect(badToken.body.msg).toBe('Token is not valid');
  });
});

describe('contacts API', () => {
  test('requires auth for private contact routes', async () => {
    const getContacts = await request(app).get('/api/contacts').expect(401);

    expect(getContacts.body.msg).toBe('No token, authorization denied');

    const create = await request(app)
      .post('/api/contacts')
      .send({ name: 'No Auth', email: 'no-auth@example.com' })
      .expect(401);

    expect(create.body.msg).toBe('No token, authorization denied');

    const dryRun = await request(app)
      .post('/api/contacts/import/dry-run')
      .send({ contacts: [] })
      .expect(401);

    expect(dryRun.body.msg).toBe('No token, authorization denied');

    const update = await request(app)
      .put(`/api/contacts/${new mongoose.Types.ObjectId().toString()}`)
      .send({ phone: '555-4444' })
      .expect(401);

    expect(update.body.msg).toBe('No token, authorization denied');

    const remove = await request(app)
      .delete(`/api/contacts/${new mongoose.Types.ObjectId().toString()}`)
      .expect(401);

    expect(remove.body.msg).toBe('No token, authorization denied');
  });

  test('creates, lists, updates, and deletes an owned contact', async () => {
    const token = await registerUser('owner');
    const contact = await createContact(token);

    const list = await request(app)
      .get('/api/contacts')
      .set('x-auth-token', token)
      .expect(200);

    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      type: 'professional'
    });

    const updated = await request(app)
      .put(`/api/contacts/${contact._id}`)
      .set('x-auth-token', token)
      .send({ phone: '555-0199', type: 'personal' })
      .expect(200);

    expect(updated.body.phone).toBe('555-0199');
    expect(updated.body.type).toBe('personal');

    await request(app)
      .delete(`/api/contacts/${contact._id}`)
      .set('x-auth-token', token)
      .expect(200);

    const emptyList = await request(app)
      .get('/api/contacts')
      .set('x-auth-token', token)
      .expect(200);

    expect(emptyList.body).toHaveLength(0);
  });

  test('lists only contacts owned by the authenticated user', async () => {
    const ownerToken = await registerUser('list-owner');
    const otherToken = await registerUser('list-other');

    await createContact(ownerToken, { name: 'Owner Contact' });
    await createContact(otherToken, { name: 'Other Contact' });

    const ownerList = await request(app)
      .get('/api/contacts')
      .set('x-auth-token', ownerToken)
      .expect(200);

    expect(ownerList.body).toHaveLength(1);
    expect(ownerList.body[0].name).toBe('Owner Contact');
  });

  test('rejects invalid contact payloads', async () => {
    const token = await registerUser('invalid-contact');

    const res = await request(app)
      .post('/api/contacts')
      .set('x-auth-token', token)
      .send({ name: '', email: 'not-email', type: 'vendor' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Name is required' }),
        expect.objectContaining({ msg: 'Please include a valid email' }),
        expect.objectContaining({
          msg: 'Contact type must be personal or professional'
        })
      ])
    );
  });

  test('prevents users from mutating contacts they do not own', async () => {
    const ownerToken = await registerUser('owner-boundary');
    const otherToken = await registerUser('other-boundary');
    const contact = await createContact(ownerToken);

    const update = await request(app)
      .put(`/api/contacts/${contact._id}`)
      .set('x-auth-token', otherToken)
      .send({ phone: '555-0000' })
      .expect(401);

    expect(update.body.msg).toBe('Not authorized');

    const remove = await request(app)
      .delete(`/api/contacts/${contact._id}`)
      .set('x-auth-token', otherToken)
      .expect(401);

    expect(remove.body.msg).toBe('Not authorized');
  });

  test('rejects invalid contact update payloads', async () => {
    const token = await registerUser('invalid-update');
    const contact = await createContact(token);

    const res = await request(app)
      .put(`/api/contacts/${contact._id}`)
      .set('x-auth-token', token)
      .send({ email: 'not-email', type: 'vendor' })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Please include a valid email' }),
        expect.objectContaining({
          msg: 'Contact type must be personal or professional'
        })
      ])
    );
  });

  test('returns 404 for unknown contact ids', async () => {
    const token = await registerUser('unknown-id');
    const unknownId = new mongoose.Types.ObjectId().toString();

    const update = await request(app)
      .put(`/api/contacts/${unknownId}`)
      .set('x-auth-token', token)
      .send({ phone: '555-2222' })
      .expect(404);

    expect(update.body.msg).toBe('Contact not found');

    const remove = await request(app)
      .delete(`/api/contacts/${unknownId}`)
      .set('x-auth-token', token)
      .expect(404);

    expect(remove.body.msg).toBe('Contact not found');
  });

  test('returns a safe response for malformed contact ids', async () => {
    const token = await registerUser('bad-id');

    const update = await request(app)
      .put('/api/contacts/not-an-id')
      .set('x-auth-token', token)
      .send({ phone: '555-1111' })
      .expect(400);

    expect(update.body.msg).toBe('Invalid contact id');

    const remove = await request(app)
      .delete('/api/contacts/not-an-id')
      .set('x-auth-token', token)
      .expect(400);

    expect(remove.body.msg).toBe('Invalid contact id');
  });

  test('validates contact import dry runs with reconciliation output', async () => {
    const token = await registerUser('import-dry-run');
    await createContact(token, {
      name: 'Existing Contact',
      email: 'existing@example.com'
    });

    const res = await request(app)
      .post('/api/contacts/import/dry-run')
      .set('x-auth-token', token)
      .send({
        contacts: [
          {
            name: 'Valid Import',
            email: 'valid@example.com',
            phone: '555-2222',
            type: 'professional'
          },
          {
            name: 'Existing Duplicate',
            email: 'EXISTING@example.com',
            type: 'personal'
          },
          {
            name: 'Import Duplicate',
            email: 'valid@example.com',
            type: 'professional'
          },
          {
            email: 'missing-name@example.com',
            type: 'personal'
          },
          {
            name: 'Bad Email',
            email: 'not-email',
            type: 'vendor'
          }
        ]
      })
      .expect(200);

    expect(res.body.summary).toMatchObject({
      totalRows: 5,
      validRows: 1,
      invalidRows: 4,
      duplicateRows: 2,
      missingRequiredRows: 1,
      uniqueDuplicateEmails: 2
    });
    expect(res.body.validRows[0]).toMatchObject({
      rowNumber: 1,
      row: {
        name: 'Valid Import',
        email: 'valid@example.com',
        phone: '555-2222',
        type: 'professional'
      }
    });
    expect(res.body.duplicates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rowNumber: 2,
          email: 'existing@example.com',
          source: 'existing-contact'
        }),
        expect.objectContaining({
          rowNumber: 3,
          email: 'valid@example.com',
          source: 'import-file'
        })
      ])
    );
    expect(res.body.missingRequiredFields).toEqual([
      { rowNumber: 4, fields: ['name'] }
    ]);
    expect(res.body.invalidRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rowNumber: 5,
          errors: expect.arrayContaining([
            'Email must be valid',
            'Type must be personal or professional'
          ])
        })
      ])
    );

    const contacts = await Contact.find({});
    expect(contacts).toHaveLength(1);
    expect(contacts[0].email).toBe('existing@example.com');
  });

  test('rejects malformed and oversized import dry-run payloads', async () => {
    const token = await registerUser('bad-import');

    const malformed = await request(app)
      .post('/api/contacts/import/dry-run')
      .set('x-auth-token', token)
      .send({ contacts: 'not-an-array' })
      .expect(400);

    expect(malformed.body.msg).toBe('contacts must be an array');

    const oversized = await request(app)
      .post('/api/contacts/import/dry-run')
      .set('x-auth-token', token)
      .send({
        contacts: Array.from({ length: 101 }, (_, index) => ({
          name: `Contact ${index}`,
          email: `contact-${index}@example.com`
        }))
      })
      .expect(400);

    expect(oversized.body.msg).toBe('Import dry run is limited to 100 rows');
  });
});
