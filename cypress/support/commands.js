// Custom Cypress commands for reuse

// Define API URL from Cypress environment
const API_URL = 'http://13.48.199.77:3001';

Cypress.Commands.add('signupUI', (user) => {
  cy.visit('/signup');
  
  // Wait for form to be loaded
  cy.get('form').should('exist');
  
  // Fill in the form fields
  if (user.firstName) {
    cy.get('input[name="firstName"]').should('be.visible').clear().type(user.firstName);
  }
  if (user.lastName) {
    cy.get('input[name="lastName"]').should('be.visible').clear().type(user.lastName);
  }
  if (user.email) {
    cy.get('input[name="email"]').should('be.visible').clear().type(user.email);
  }
  if (user.password) {
    cy.get('input[name="password"]').should('be.visible').clear().type(user.password);
  }
  if (user.confirmPassword) {
    cy.get('input[name="confirmPassword"]').should('be.visible').clear().type(user.confirmPassword);
  }

  // Submit the form
  cy.get('button[type="submit"]').should('be.visible').click();
});

Cypress.Commands.add('loginUI', (email, password) => {
  // Visit login page and wait for it to load
  cy.visit('/login');
  cy.get('form').should('exist');
  
  // Fill in credentials
  cy.get('input[name="email"]').clear().type(email, { delay: 50 });
  cy.get('input[name="password"]').clear().type(password, { delay: 50 });
  
  // Submit the form
  cy.get('button[type="submit"]').should('be.visible').and('be.enabled').click();
});

Cypress.Commands.add('selectService', (serviceName) => {
  // Go to dashboard where services can be selected
  cy.visit('/dashboard');
  
  // Ensure services panel is expanded
  cy.get('.booking-panel').first().then($panel => {
    if ($panel.find('.dropdown-arrow.collapsed').length > 0) {
      cy.wrap($panel).find('.panel-header').click();
    }
  });
  
  // Select the service by clicking it
  cy.get('.panel-content .service-item')
    .contains(serviceName)
    .click();
});
