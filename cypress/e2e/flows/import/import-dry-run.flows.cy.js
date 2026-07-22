import { contactsPage } from '../../../support/pages/ContactsPage';
import { importPage } from '../../../support/pages/ImportPage';
import { DEVICE_VIEWPORTS } from '../../../support/viewports';

describe('Import dry-run flows', { tags: ['@import', '@regression'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
        cy.mockContactKeepApi();
        cy.visitAuthenticated();
        cy.waitForWorkspace();
      });

      context('server-side dry-run validation', { tags: ['@validation'] }, () => {
        it(
          'validates import data without saving contacts',
          { tags: ['@critical'] },
          function () {
            cy.submitImportPayload(this.contacts.importPayload);

            cy.wait('@importDryRun')
              .its('request.body.contacts')
              .should('have.length', 3);

            importPage
              .totalSummary()
              .should(
                'contain',
                `Total ${this.importReports.mixed.summary.totalRows}`
              );
            importPage
              .validSummary()
              .should(
                'contain',
                `Valid ${this.importReports.mixed.summary.validRows}`
              );
            importPage
              .invalidSummary()
              .should(
                'contain',
                `Invalid ${this.importReports.mixed.summary.invalidRows}`
              );
            importPage
              .duplicatesSummary()
              .should(
                'contain',
                `Duplicates ${this.importReports.mixed.summary.duplicateRows}`
              );
            importPage.missingFieldsList().should('contain', 'Row 2: name');
            importPage.duplicateList().should('contain', 'grace@example.com');
            contactsPage.list().should('not.contain', 'Valid Import');
            contactsPage.list().should('contain', 'Grace Hopper');

            cy.assertAnalyticsEvent(
              'contact_import_dry_run_completed',
              events => {
                expect(events[0].payload).to.include({
                  totalRows: 3,
                  validRows: 1,
                  invalidRows: 2,
                  duplicateRows: 1
                });
              }
            );
            cy.assertAnalyticsDoesNotLeak(['valid@example.com', '555-0200']);
          }
        );
      });

      context('client-side JSON validation', { tags: ['@negative'] }, () => {
        it(
          'shows client-side import JSON validation before calling the API',
          { tags: ['@regression'] },
          () => {
            cy.submitRawImportPayload('{ bad json');

            importPage
              .error()
              .should('contain', 'Import data must be valid JSON.');
            cy.get('@importDryRun.all').should('have.length', 0);
          }
        );
      });
    });
  });
});
