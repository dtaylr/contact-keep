import { contactsPage } from '../../support/pages/ContactsPage';
import { registerPage } from '../../support/pages/RegisterPage';
import { DEVICE_VIEWPORTS } from '../../support/viewports';

describe('User journey: authentication', { tags: ['@journey', '@auth'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
        cy.mockContactKeepApi();
      });

      context('new user registration', { tags: ['@registration'] }, () => {
        it('registers a new user and records privacy-safe analytics', { tags: ['@critical', '@analytics'] }, function () {
          const { newUser, primary } = this.users;

          cy.visit('/register');
          cy.fillRegistrationForm(newUser);
          registerPage.submitButton().click();

          cy.wait('@register')
            .its('request.body')
            .should('include', {
              name: newUser.name,
              email: newUser.email
            });
          cy.waitForWorkspace();
          cy.contains('Good to see you, Ada').should('be.visible');

          cy.assertAnalyticsEvent('auth_register_success', events => {
            expect(events[0].payload.userId).to.eq(primary._id);
            expect(events[0].payload.timestamp).to.match(
              /^\d{4}-\d{2}-\d{2}T/
            );
          });
          cy.assertAnalyticsDoesNotLeak([newUser.password]);
        });
      });

      context('existing user session', { tags: ['@login'] }, () => {
        it('logs in, reaches the workspace, and logs out cleanly', { tags: ['@critical', '@smoke'] }, function () {
          const user = this.users.primary;

          cy.loginAs(user);

          cy.wait('@login')
            .its('request.body')
            .should('include', { email: user.email });
          cy.waitForWorkspace();
          cy.contains(`Hello ${user.name}`).should('be.visible');

          contactsPage.logoutLink().click();

          cy.location('pathname').should('eq', '/login');
          cy.window().should(win => {
            expect(win.localStorage.getItem('token')).to.eq(null);
          });
        });
      });
    });
  });
});
