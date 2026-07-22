export const resetBrowserState = () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window({ log: false }).then(win => {
    win.sessionStorage.clear();
    win.__CONTACT_KEEP_ANALYTICS__ = [];
  });
};
