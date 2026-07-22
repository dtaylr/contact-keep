import { mockContactKeepApi } from './mocks/api';
import { getAuthToken } from './data/auth';
import { applyDeviceViewport } from './viewports';
import { contactsPage } from './pages/ContactsPage';
import { importPage } from './pages/ImportPage';
import { loginPage } from './pages/LoginPage';
import { registerPage } from './pages/RegisterPage';
import { resetBrowserState } from './state';

Cypress.Commands.add('mockContactKeepApi', options => {
  mockContactKeepApi(options);
});

Cypress.Commands.add('loadFixtures', () => {
  cy.fixture('users.json').as('users');
  cy.fixture('contacts.json').as('contacts');
  cy.fixture('importReports.json').as('importReports');
});

Cypress.Commands.add('useDevice', device => {
  applyDeviceViewport(device);
});

Cypress.Commands.add('clearAppState', () => {
  resetBrowserState();
});

Cypress.Commands.add('assertAnalyticsEvent', (eventName, assertion) => {
  cy.window()
    .its('__CONTACT_KEEP_ANALYTICS__')
    .should(events => {
      const matches = (events || []).filter(
        event => event.eventName === eventName
      );

      expect(matches, `${eventName} events`).to.have.length.greaterThan(0);

      if (assertion) {
        assertion(matches);
      }
    });
});

Cypress.Commands.add('assertNoAnalyticsEvent', eventName => {
  cy.window().then(win => {
    const events = win.__CONTACT_KEEP_ANALYTICS__ || [];
    expect(
      events.filter(event => event.eventName === eventName),
      `${eventName} events`
    ).to.have.length(0);
  });
});

Cypress.Commands.add('assertAnalyticsDoesNotLeak', values => {
  cy.window().then(win => {
    const serialized = JSON.stringify(win.__CONTACT_KEEP_ANALYTICS__ || []);
    values.forEach(value => {
      expect(serialized).not.to.include(value);
    });
  });
});

Cypress.Commands.add('visitAuthenticated', (path = '/') => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('token', getAuthToken());
    }
  });
});

Cypress.Commands.add('waitForWorkspace', () => {
  cy.wait('@loadUser');
  cy.wait('@getContacts');
  contactsPage.workspace().should('be.visible');
});

Cypress.Commands.add('loginAs', user => {
  cy.visit('/login');
  loginPage.emailInput().clear().type(user.email);
  loginPage.passwordInput().clear().type(user.password, { log: false });
  loginPage.submitButton().click();
});

Cypress.Commands.add('fillRegistrationForm', (user, passwordConfirmation) => {
  registerPage.nameInput().clear().type(user.name);
  registerPage.emailInput().clear().type(user.email);
  registerPage.passwordInput().clear().type(user.password, { log: false });
  registerPage
    .confirmPasswordInput()
    .clear()
    .type(passwordConfirmation || user.password, { log: false });
});

Cypress.Commands.add('fillContactForm', contact => {
  contactsPage.nameInput().clear().type(contact.name);
  contactsPage.emailInput().clear().type(contact.email);

  if (contact.phone) {
    contactsPage.phoneInput().clear().type(contact.phone);
  }

  contactsPage.typeRadio(contact.type).check();
});

Cypress.Commands.add('submitImportPayload', payload => {
  importPage
    .payloadInput()
    .clear()
    .type(JSON.stringify(payload), { parseSpecialCharSequences: false });
  importPage.submitButton().click();
});

Cypress.Commands.add('submitRawImportPayload', payload => {
  importPage
    .payloadInput()
    .clear()
    .type(payload, { parseSpecialCharSequences: false });
  importPage.submitButton().click();
});
