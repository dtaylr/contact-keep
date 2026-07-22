import { contactsPage } from '../../../support/pages/ContactsPage';
import { DEVICE_VIEWPORTS } from '../../../support/viewports';

describe('Analytics privacy flows', { tags: ['@analytics', '@regression'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
        cy.mockContactKeepApi();
      });

      context('privacy-safe event payloads', { tags: ['@privacy'] }, () => {
        it('captures timestamps while excluding secrets and contact details', { tags: ['@critical'] }, function () {
          const { primary } = this.users;
          const { newProfessional } = this.contacts;

          cy.loginAs(primary);
          cy.wait('@login')
            .its('request.body')
            .should('include', { email: primary.email });
          cy.waitForWorkspace();

          cy.fillContactForm(newProfessional);
          contactsPage.submitButton().click();
          cy.wait('@createContact')
            .its('request.body')
            .should('include', { email: newProfessional.email });

          cy.window()
            .its('__CONTACT_KEEP_ANALYTICS__')
            .should(events => {
              events.forEach(event => {
                expect(event.payload.timestamp).to.match(
                  /^\d{4}-\d{2}-\d{2}T/
                );
              });
            });

          cy.assertAnalyticsDoesNotLeak([
            primary.password,
            newProfessional.email,
            newProfessional.phone
          ]);
        });
      });
    });
  });
});
