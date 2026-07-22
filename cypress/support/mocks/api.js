import contactsFixture from '../../fixtures/contacts.json';
import importReports from '../../fixtures/importReports.json';
import users from '../../fixtures/users.json';
import { getAuthToken } from '../data/auth';

const clone = value => JSON.parse(JSON.stringify(value));

const getContactFromRequest = (body, id = 'contact-2') => ({
  _id: id,
  name: body.name,
  email: body.email,
  phone: body.phone,
  type: body.type || 'personal'
});

export const mockContactKeepApi = (options = {}) => {
  const activeUser = options.user || users.primary;
  const authToken = options.authToken || getAuthToken();
  let contacts = clone(
    Object.prototype.hasOwnProperty.call(options, 'contacts')
      ? options.contacts
      : contactsFixture.initial
  );

  cy.intercept('GET', '/api/auth', req => {
    if (req.headers['x-auth-token'] === authToken) {
      req.reply(activeUser);
      return;
    }

    req.reply({
      statusCode: 401,
      body: { msg: 'No token, authorization denied' }
    });
  }).as('loadUser');

  cy.intercept('POST', '/api/auth', req => {
    if (options.loginError) {
      req.reply(options.loginError);
      return;
    }

    req.reply({
      statusCode: 200,
      body: { token: authToken }
    });
  }).as('login');

  cy.intercept('POST', '/api/users', req => {
    if (options.registerError) {
      req.reply(options.registerError);
      return;
    }

    req.reply({
      statusCode: 200,
      body: { token: authToken }
    });
  }).as('register');

  cy.intercept('GET', '/api/contacts', req => {
    req.reply(clone(contacts));
  }).as('getContacts');

  cy.intercept('POST', '/api/contacts', req => {
    if (options.createContactError) {
      req.reply(options.createContactError);
      return;
    }

    const contact = getContactFromRequest(req.body);
    contacts = [contact, ...contacts];
    req.reply(contact);
  }).as('createContact');

  cy.intercept('PUT', '/api/contacts/*', req => {
    if (options.updateContactError) {
      req.reply(options.updateContactError);
      return;
    }

    const id = req.url.split('/').pop();
    contacts = contacts.map(contact =>
      contact._id === id ? { ...contact, ...req.body } : contact
    );
    req.reply(contacts.find(contact => contact._id === id));
  }).as('updateContact');

  cy.intercept('DELETE', '/api/contacts/*', req => {
    if (options.deleteContactError) {
      req.reply(options.deleteContactError);
      return;
    }

    const id = req.url.split('/').pop();
    contacts = contacts.filter(contact => contact._id !== id);
    req.reply({ msg: 'Contact removed' });
  }).as('deleteContact');

  cy.intercept('POST', '/api/contacts/import/dry-run', req => {
    if (options.importDryRunError) {
      req.reply(options.importDryRunError);
      return;
    }

    req.reply(options.importReport || importReports.mixed);
  }).as('importDryRun');
};
