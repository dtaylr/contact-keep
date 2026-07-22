export class RegisterPage {
  nameInput() {
    return cy.get('[data-cy=register-name]');
  }

  emailInput() {
    return cy.get('[data-cy=register-email]');
  }

  passwordInput() {
    return cy.get('[data-cy=register-password]');
  }

  confirmPasswordInput() {
    return cy.get('[data-cy=register-confirm-password]');
  }

  submitButton() {
    return cy.get('[data-cy=register-submit]');
  }

  alert(message) {
    return cy.contains(message);
  }
}

export const registerPage = new RegisterPage();
