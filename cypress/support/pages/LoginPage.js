export class LoginPage {
  emailInput() {
    return cy.get('[data-cy=login-email]');
  }

  passwordInput() {
    return cy.get('[data-cy=login-password]');
  }

  submitButton() {
    return cy.get('[data-cy=login-submit]');
  }

  alert(message) {
    return cy.contains(message);
  }
}

export const loginPage = new LoginPage();
