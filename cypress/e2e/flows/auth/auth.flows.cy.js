import { contactsPage } from '../../../support/pages/ContactsPage';
import { loginPage } from '../../../support/pages/LoginPage';
import { registerPage } from '../../../support/pages/RegisterPage';
import { DEVICE_VIEWPORTS } from '../../../support/viewports';

describe('Auth flows', { tags: ['@auth', '@regression'] }, () => {
  DEVICE_VIEWPORTS.forEach(device => {
    context(`${device.label} viewport`, { tags: device.tags }, () => {
      beforeEach(function () {
        cy.useDevice(device);
        cy.loadFixtures();
      });

      context('stored-token session', { tags: ['@session'] }, () => {
        it('reloads an authenticated session from the stored token', { tags: ['@critical'] }, function () {
          cy.mockContactKeepApi();

          cy.visitAuthenticated();
          cy.waitForWorkspace();

          cy.contains(`Hello ${this.users.primary.name}`).should('be.visible');
          contactsPage.list().should('contain', 'Grace Hopper');
        });
      });

      context('login failure', { tags: ['@login', '@negative'] }, () => {
        it('shows login errors without success analytics', { tags: ['@critical'] }, function () {
          cy.mockContactKeepApi({
            loginError: {
              statusCode: 400,
              body: { msg: 'Invalid Credentials' }
            }
          });

          cy.loginAs({
            email: this.users.primary.email,
            password: 'wrong-password'
          });

          cy.wait('@login')
            .its('response.statusCode')
            .should('eq', 400);
          loginPage.alert('Invalid Credentials').should('be.visible');
          cy.assertNoAnalyticsEvent('auth_login_success');
        });
      });

      context(
        'registration validation',
        { tags: ['@registration', '@negative'] },
        () => {
          it(
            'shows client-side validation for mismatched registration passwords',
            { tags: ['@regression'] },
            function () {
              cy.mockContactKeepApi();

              cy.visit('/register');
              cy.fillRegistrationForm(this.users.newUser, 'password456');
              registerPage.submitButton().click();

              registerPage.alert('Passwords do not match').should('be.visible');
              cy.get('@register.all').should('have.length', 0);
            }
          );
        }
      );
    });
  });
});
