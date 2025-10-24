// Import custom commands and any global behaviors
import './commands';

// Optionally clear localStorage between tests to keep isolation
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
