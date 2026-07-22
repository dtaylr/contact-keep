export class ImportPage {
  payloadInput() {
    return cy.get('[data-cy=import-payload]');
  }

  submitButton() {
    return cy.get('[data-cy=import-submit]');
  }

  totalSummary() {
    return cy.get('[data-cy=import-total]');
  }

  validSummary() {
    return cy.get('[data-cy=import-valid]');
  }

  invalidSummary() {
    return cy.get('[data-cy=import-invalid]');
  }

  duplicatesSummary() {
    return cy.get('[data-cy=import-duplicates]');
  }

  missingFieldsList() {
    return cy.get('[data-cy=import-missing-fields]');
  }

  duplicateList() {
    return cy.get('[data-cy=import-duplicate-list]');
  }

  error() {
    return cy.get('[data-cy=import-error]');
  }
}

export const importPage = new ImportPage();
