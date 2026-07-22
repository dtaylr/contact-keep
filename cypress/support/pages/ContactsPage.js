export class ContactsPage {
  workspace() {
    return cy.get('[data-cy=contact-workspace]');
  }

  nameInput() {
    return cy.get('[data-cy=contact-name]');
  }

  emailInput() {
    return cy.get('[data-cy=contact-email]');
  }

  phoneInput() {
    return cy.get('[data-cy=contact-phone]');
  }

  typeRadio(type) {
    return cy.get(`[data-cy=contact-type-${type}]`);
  }

  submitButton() {
    return cy.get('[data-cy=contact-submit]');
  }

  editButton(contactId) {
    return cy.get(`[data-cy=edit-contact-${contactId}]`);
  }

  deleteButton(contactId) {
    return cy.get(`[data-cy=delete-contact-${contactId}]`);
  }

  filterInput() {
    return cy.get('[data-cy=contact-filter]');
  }

  list() {
    return cy.get('[data-cy=contact-list]');
  }

  emptyState() {
    return cy.get('[data-cy=empty-contact-state]');
  }

  insight(testId) {
    return cy.get(`[data-cy=${testId}]`);
  }

  contactPhone(contactId) {
    return cy.get(`[data-cy=contact-phone-${contactId}]`);
  }

  logoutLink() {
    return cy.get('[data-cy=logout-link]');
  }
}

export const contactsPage = new ContactsPage();
