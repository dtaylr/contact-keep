const user = {
  _id: 'user-1',
  name: 'Ada QA',
  email: 'ada.qa@example.com'
};
const authToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoidXNlci0xIn19.test';

const firstContact = {
  _id: 'contact-1',
  name: 'Grace Hopper',
  email: 'grace@example.com',
  phone: '555-0101',
  type: 'professional'
};

const nextContact = body => ({
  _id: 'contact-2',
  name: body.name,
  email: body.email,
  phone: body.phone,
  type: body.type
});

const importDryRunReport = {
  validRows: [
    {
      rowNumber: 1,
      row: {
        name: 'Valid Import',
        email: 'valid@example.com',
        phone: '555-0200',
        type: 'professional'
      }
    }
  ],
  invalidRows: [
    {
      rowNumber: 2,
      row: {
        name: '',
        email: 'missing-name@example.com',
        phone: '',
        type: 'personal'
      },
      errors: ['Missing required field: name']
    },
    {
      rowNumber: 3,
      row: {
        name: 'Existing Duplicate',
        email: 'grace@example.com',
        phone: '',
        type: 'professional'
      },
      errors: ['Duplicate email already exists']
    }
  ],
  duplicates: [
    {
      rowNumber: 3,
      email: 'grace@example.com',
      source: 'existing-contact'
    }
  ],
  missingRequiredFields: [
    {
      rowNumber: 2,
      fields: ['name']
    }
  ],
  summary: {
    totalRows: 3,
    validRows: 1,
    invalidRows: 2,
    duplicateRows: 1,
    missingRequiredRows: 1,
    uniqueDuplicateEmails: 1
  }
};

const stubApi = (initialContacts = [firstContact]) => {
  let contacts = [...initialContacts];

  cy.intercept('GET', '/api/auth', req => {
    if (req.headers['x-auth-token'] === authToken) {
      req.reply(user);
      return;
    }

    req.reply({ statusCode: 401, body: { msg: 'No token, authorization denied' } });
  }).as('loadUser');

  cy.intercept('POST', '/api/auth', {
    statusCode: 200,
    body: { token: authToken }
  }).as('login');

  cy.intercept('POST', '/api/users', {
    statusCode: 200,
    body: { token: authToken }
  }).as('register');

  cy.intercept('GET', '/api/contacts', req => {
    req.reply(contacts);
  }).as('getContacts');

  cy.intercept('POST', '/api/contacts', req => {
    const contact = nextContact(req.body);
    contacts = [contact, ...contacts];
    req.reply(contact);
  }).as('createContact');

  cy.intercept('PUT', '/api/contacts/*', req => {
    const id = req.url.split('/').pop();
    contacts = contacts.map(contact =>
      contact._id === id ? { ...contact, ...req.body } : contact
    );
    req.reply(contacts.find(contact => contact._id === id));
  }).as('updateContact');

  cy.intercept('DELETE', '/api/contacts/*', req => {
    const id = req.url.split('/').pop();
    contacts = contacts.filter(contact => contact._id !== id);
    req.reply({ msg: 'Contact removed' });
  }).as('deleteContact');

  cy.intercept('POST', '/api/contacts/import/dry-run', req => {
    req.reply(importDryRunReport);
  }).as('importDryRun');
};

describe('Contact Keep critical flows', () => {
  beforeEach(() => {
    stubApi();
  });

  it('logs in and manages contacts with analytics events', () => {
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('password123');
    cy.get('[data-cy=login-submit]').click();

    cy.wait('@login');
    cy.wait('@getContacts');
    cy.contains('Hello Ada QA');
    cy.get('[data-cy=contact-list]').contains('Grace Hopper');

    cy.get('[data-cy=contact-name]').type('Katherine Johnson');
    cy.get('[data-cy=contact-email]').type('katherine@example.com');
    cy.get('[data-cy=contact-phone]').type('555-0202');
    cy.get('[data-cy=contact-type-professional]').check();
    cy.get('[data-cy=contact-submit]').click();

    cy.wait('@createContact');
    cy.get('[data-cy=contact-list]').contains('Katherine Johnson');

    cy.get('[data-cy=contact-filter]').type('Katherine');
    cy.get('[data-cy=contact-list]').contains('Katherine Johnson');
    cy.get('[data-cy=contact-list]').contains('Grace Hopper').should('not.exist');

    cy.get('[data-cy=contact-filter]').clear();
    cy.get('[data-cy=contact-list]').contains('Grace Hopper');

    cy.get('[data-cy=edit-contact-contact-2]').click();
    cy.get('[data-cy=contact-phone]').clear().type('555-0303');
    cy.get('[data-cy=contact-submit]').click();

    cy.wait('@updateContact');
    cy.get('[data-cy=contact-list]').contains('555-0303');

    cy.get('[data-cy=delete-contact-contact-2]').click();
    cy.wait('@deleteContact');
    cy.get('[data-cy=contact-list]')
      .contains('Katherine Johnson')
      .should('not.exist');

    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        const byName = eventName =>
          events.filter(event => event.eventName === eventName);

        expect(byName('auth_login_success')).to.have.length(1);
        expect(byName('auth_login_success')[0].payload).to.include({
          userId: user._id
        });

        expect(byName('contact_created')).to.have.length(1);
        expect(byName('contact_created')[0].payload).to.include({
          contactId: 'contact-2',
          type: 'professional'
        });

        expect(byName('contact_updated')).to.have.length(1);
        expect(byName('contact_updated')[0].payload.contactId).to.eq(
          'contact-2'
        );
        expect(byName('contact_updated')[0].payload.changedFields).to.include(
          'phone'
        );

        expect(byName('contact_deleted')).to.have.length(1);
        expect(byName('contact_deleted')[0].payload.contactId).to.eq(
          'contact-2'
        );

        expect(byName('contact_filter_used')).to.have.length(1);
        expect(byName('contact_filter_used')[0].payload.queryLength).to.eq(1);

        events.forEach(event => {
          expect(event.payload.timestamp).to.match(
            /^\d{4}-\d{2}-\d{2}T/
          );
        });

        const serialized = JSON.stringify(events);
        expect(serialized).not.to.include('password123');
        expect(serialized).not.to.include('katherine@example.com');
        expect(serialized).not.to.include('555-0303');
      });
  });

  it('registers with a privacy-safe analytics event', () => {
    cy.visit('/register');
    cy.get('[data-cy=register-name]').type('Ada QA');
    cy.get('[data-cy=register-email]').type('ada.qa@example.com');
    cy.get('[data-cy=register-password]').type('password123');
    cy.get('[data-cy=register-confirm-password]').type('password123');
    cy.get('[data-cy=register-submit]').click();

    cy.wait('@register');

    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        const registerEvents = events.filter(
          event => event.eventName === 'auth_register_success'
        );

        expect(registerEvents).to.have.length(1);
        expect(registerEvents[0].payload.userId).to.eq(user._id);
        expect(registerEvents[0].payload.timestamp).to.match(
          /^\d{4}-\d{2}-\d{2}T/
        );

        const serialized = JSON.stringify(events);
        expect(serialized).not.to.include('password123');
        expect(serialized).not.to.include(authToken);
      });
  });

  it('reloads an authenticated session from the stored token', () => {
    window.localStorage.setItem('token', authToken);

    cy.visit('/');
    cy.wait('@loadUser');
    cy.wait('@getContacts');

    cy.contains('Hello Ada QA');
    cy.get('[data-cy=contact-list]').contains('Grace Hopper');
  });

  it('logs out and clears the stored token', () => {
    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('password123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait('@getContacts');

    cy.get('[data-cy=logout-link]').click();

    cy.location('pathname').should('eq', '/login');
    cy.window().then(win => {
      expect(win.localStorage.getItem('token')).to.eq(null);
    });
  });

  it('shows the empty contacts state', () => {
    stubApi([]);
    window.localStorage.setItem('token', authToken);

    cy.visit('/');
    cy.wait('@getContacts');

    cy.contains('Please add a contact');
  });

  it('validates contact import data without saving contacts', () => {
    window.localStorage.setItem('token', authToken);

    cy.visit('/');
    cy.wait('@getContacts');

    cy.get('[data-cy=import-payload]')
      .clear()
      .type(
        JSON.stringify([
          {
            name: 'Valid Import',
            email: 'valid@example.com',
            phone: '555-0200',
            type: 'professional'
          },
          {
            email: 'missing-name@example.com',
            type: 'personal'
          },
          {
            name: 'Existing Duplicate',
            email: 'grace@example.com',
            type: 'professional'
          }
        ]),
        { parseSpecialCharSequences: false }
      );
    cy.get('[data-cy=import-submit]').click();

    cy.wait('@importDryRun')
      .its('request.body.contacts')
      .should('have.length', 3);

    cy.get('[data-cy=import-total]').contains('Total 3');
    cy.get('[data-cy=import-valid]').contains('Valid 1');
    cy.get('[data-cy=import-invalid]').contains('Invalid 2');
    cy.get('[data-cy=import-duplicates]').contains('Duplicates 1');
    cy.get('[data-cy=import-missing-fields]').contains('Row 2: name');
    cy.get('[data-cy=import-duplicate-list]').contains(
      'grace@example.com'
    );
    cy.get('[data-cy=contact-list]')
      .contains('Valid Import')
      .should('not.exist');
    cy.get('[data-cy=contact-list]').contains('Grace Hopper');

    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        const importEvents = events.filter(
          event => event.eventName === 'contact_import_dry_run_completed'
        );

        expect(importEvents).to.have.length(1);
        expect(importEvents[0].payload).to.include({
          totalRows: 3,
          validRows: 1,
          invalidRows: 2,
          duplicateRows: 1
        });

        const serialized = JSON.stringify(events);
        expect(serialized).not.to.include('valid@example.com');
        expect(serialized).not.to.include('555-0200');
      });
  });

  it('shows login errors without success analytics', () => {
    cy.intercept('POST', '/api/auth', {
      statusCode: 400,
      body: { msg: 'Invalid Credentials' }
    }).as('failedLogin');

    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('wrong-password');
    cy.get('[data-cy=login-submit]').click();
    cy.wait('@failedLogin');

    cy.contains('Invalid Credentials');
    cy.window().then(win => {
      const events = win.__CONTACT_KEEP_ANALYTICS__ || [];

      expect(
        events.filter(event => event.eventName === 'auth_login_success')
      ).to.have.length(0);
    });
  });

  it('does not emit success analytics for failed contact creation', () => {
    cy.intercept('POST', '/api/contacts', {
      statusCode: 400,
      body: { errors: [{ msg: 'Name is required' }] }
    }).as('failedCreateContact');

    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('password123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait('@getContacts');

    cy.get('[data-cy=contact-name]').type('Failed Contact');
    cy.get('[data-cy=contact-email]').type('failed@example.com');
    cy.get('[data-cy=contact-submit]').click();
    cy.wait('@failedCreateContact');

    cy.contains('Failed Contact').should('not.exist');
    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        expect(
          events.filter(event => event.eventName === 'contact_created')
        ).to.have.length(0);
      });
  });

  it('keeps UI state and analytics stable when update fails', () => {
    cy.intercept('PUT', '/api/contacts/*', {
      statusCode: 500,
      body: { msg: 'Server Error' }
    }).as('failedUpdateContact');

    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('password123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait('@getContacts');

    cy.get('[data-cy=edit-contact-contact-1]').click();
    cy.get('[data-cy=contact-phone]').clear().type('555-9999');
    cy.get('[data-cy=contact-submit]').click();
    cy.wait('@failedUpdateContact');

    cy.contains('555-0101');
    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        expect(
          events.filter(event => event.eventName === 'contact_updated')
        ).to.have.length(0);
      });
  });

  it('keeps UI state and analytics stable when delete fails', () => {
    cy.intercept('DELETE', '/api/contacts/*', {
      statusCode: 500,
      body: { msg: 'Server Error' }
    }).as('failedDeleteContact');

    cy.visit('/login');
    cy.get('[data-cy=login-email]').type(user.email);
    cy.get('[data-cy=login-password]').type('password123');
    cy.get('[data-cy=login-submit]').click();
    cy.wait('@getContacts');

    cy.get('[data-cy=delete-contact-contact-1]').click();
    cy.wait('@failedDeleteContact');

    cy.contains('Grace Hopper');
    cy.window()
      .its('__CONTACT_KEEP_ANALYTICS__')
      .should(events => {
        expect(
          events.filter(event => event.eventName === 'contact_deleted')
        ).to.have.length(0);
      });
  });

  it('shows client-side validation for mismatched registration passwords', () => {
    cy.visit('/register');
    cy.get('[data-cy=register-name]').type('Ada QA');
    cy.get('[data-cy=register-email]').type('ada.qa@example.com');
    cy.get('[data-cy=register-password]').type('password123');
    cy.get('[data-cy=register-confirm-password]').type('password456');
    cy.get('[data-cy=register-submit]').click();

    cy.contains('Passwords do not match');
  });
});
