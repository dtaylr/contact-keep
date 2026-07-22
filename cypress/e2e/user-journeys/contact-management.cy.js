import { contactsPage } from '../../support/pages/ContactsPage';
import { DEVICE_VIEWPORTS } from '../../support/viewports';

describe('User journey: contact management', { tags: ['@journey', '@contacts'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
        cy.mockContactKeepApi();
      });

      context('contact lifecycle', { tags: ['@crud'] }, () => {
        it('logs in and manages the full contact lifecycle', { tags: ['@critical', '@smoke'] }, function () {
          const { primary } = this.users;
          const { newProfessional } = this.contacts;

          cy.loginAs(primary);

          cy.wait('@login')
            .its('request.body')
            .should('include', { email: primary.email });
          cy.waitForWorkspace();

          contactsPage.insight('insight-total').should('contain', '2');
          contactsPage.insight('insight-professional').should('contain', '1');
          contactsPage.insight('insight-personal').should('contain', '1');
          contactsPage.list().should('contain', 'Grace Hopper');

          cy.fillContactForm(newProfessional);
          contactsPage.submitButton().click();
          cy.wait('@createContact')
            .its('request.body')
            .should('include', {
              name: newProfessional.name,
              email: newProfessional.email,
              type: newProfessional.type
            });
          contactsPage.list().should('contain', newProfessional.name);
          contactsPage.insight('insight-total').should('contain', '3');
          contactsPage.insight('insight-professional').should('contain', '2');

          contactsPage.filterInput().clear().type('Katherine');
          contactsPage.list().should('contain', newProfessional.name);
          contactsPage.list().should('not.contain', 'Grace Hopper');

          contactsPage.filterInput().clear();
          contactsPage.list().should('contain', 'Grace Hopper');

          contactsPage.editButton('contact-2').click();
          contactsPage.phoneInput().clear().type('555-0303');
          contactsPage.submitButton().click();
          cy.wait('@updateContact')
            .its('request.body')
            .should('include', { phone: '555-0303' });
          contactsPage.contactPhone('contact-2').should('contain', '555-0303');

          contactsPage.deleteButton('contact-2').click();
          cy.wait('@deleteContact')
            .its('response.body')
            .should('include', { msg: 'Contact removed' });
          contactsPage.list().should('not.contain', newProfessional.name);

          cy.assertAnalyticsEvent('auth_login_success', events => {
            expect(events[0].payload).to.include({ userId: primary._id });
          });
          cy.assertAnalyticsEvent('contact_created', events => {
            expect(events[0].payload).to.include({
              contactId: 'contact-2',
              type: 'professional'
            });
          });
          cy.assertAnalyticsEvent('contact_updated', events => {
            expect(events[0].payload.contactId).to.eq('contact-2');
            expect(events[0].payload.changedFields).to.include('phone');
          });
          cy.assertAnalyticsEvent('contact_deleted', events => {
            expect(events[0].payload.contactId).to.eq('contact-2');
          });
          cy.assertAnalyticsEvent('contact_filter_used', events => {
            expect(events[0].payload.queryLength).to.eq(1);
          });
          cy.assertAnalyticsDoesNotLeak([
            primary.password,
            newProfessional.email,
            '555-0303'
          ]);
        });
      });
    });
  });
});
