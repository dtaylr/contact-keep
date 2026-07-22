import { contactsPage } from '../../../support/pages/ContactsPage';
import { DEVICE_VIEWPORTS } from '../../../support/viewports';

describe('Contact CRUD flows', { tags: ['@contacts', '@crud'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
      });

      context('empty directory', { tags: ['@empty-state'] }, () => {
        it('shows the empty contacts state', { tags: ['@regression'] }, () => {
          cy.mockContactKeepApi({ contacts: [] });

          cy.visitAuthenticated();
          cy.waitForWorkspace();

          contactsPage.emptyState()
            .should('be.visible')
            .and('contain', 'Please add a contact');
          contactsPage.insight('insight-total').should('contain', '0');
        });
      });

      context('create error handling', { tags: ['@negative'] }, () => {
        it('does not emit success analytics for failed contact creation', { tags: ['@critical'] }, function () {
          cy.mockContactKeepApi({
            createContactError: {
              statusCode: 400,
              body: { errors: [{ msg: 'Name is required' }] }
            }
          });

          cy.visitAuthenticated();
          cy.waitForWorkspace();
          cy.fillContactForm(this.contacts.failedCreate);
          contactsPage.submitButton().click();

          cy.wait('@createContact')
            .its('response.statusCode')
            .should('eq', 400);
          cy.contains(this.contacts.failedCreate.name).should('not.exist');
          cy.assertNoAnalyticsEvent('contact_created');
        });
      });

      context('update error handling', { tags: ['@negative'] }, () => {
        it('keeps UI state and analytics stable when update fails', { tags: ['@regression'] }, () => {
          cy.mockContactKeepApi({
            updateContactError: {
              statusCode: 500,
              body: { msg: 'Server Error' }
            }
          });

          cy.visitAuthenticated();
          cy.waitForWorkspace();
          contactsPage.editButton('contact-1').click();
          contactsPage.phoneInput().clear().type('555-9999');
          contactsPage.submitButton().click();

          cy.wait('@updateContact')
            .its('response.statusCode')
            .should('eq', 500);
          contactsPage.contactPhone('contact-1').should('contain', '555-0101');
          cy.assertNoAnalyticsEvent('contact_updated');
        });
      });

      context('delete error handling', { tags: ['@negative'] }, () => {
        it('keeps UI state and analytics stable when delete fails', { tags: ['@regression'] }, () => {
          cy.mockContactKeepApi({
            deleteContactError: {
              statusCode: 500,
              body: { msg: 'Server Error' }
            }
          });

          cy.visitAuthenticated();
          cy.waitForWorkspace();
          contactsPage.deleteButton('contact-1').click();

          cy.wait('@deleteContact')
            .its('response.statusCode')
            .should('eq', 500);
          contactsPage.list().should('contain', 'Grace Hopper');
          cy.assertNoAnalyticsEvent('contact_deleted');
        });
      });
    });
  });
});
