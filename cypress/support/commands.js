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
  cy.visit('/login');
  cy.get('input[name="email"]').clear().type(email, { delay: 50 });
  cy.get('input[name="password"]').clear().type(password, { delay: 50 });
  cy.get('button[type="submit"]').should('be.visible').and('be.enabled').click();
});

Cypress.Commands.add('addProductToCart', (productName) => {
  cy.visit('/products');
  cy.intercept('POST', '**/cart').as('addToCart');
  
  // Try to find a product by visible text or button label
  cy.contains(productName)
    .should('be.visible')
    .closest('article, .product, .card')
    .within(() => {
      // prefer a button with add-to-cart text
      cy.get('button')
        .contains(/add to cart|add|buy/i)
        .should('be.visible')
        .and('be.enabled')
        .click();
    });

  // Wait for the network request to complete
  cy.wait('@addToCart').its('response.statusCode').should('be.oneOf', [200, 201]);
});

// Utility command for clearing the cart
Cypress.Commands.add('clearCart', () => {
  cy.get('a[href="/cart"], .cart-icon, button[aria-label="cart"]').click({ force: true });
  cy.get('tr, li, .cart-item').each(($item) => {
    cy.wrap($item).within(() => {
      cy.get('button').contains(/remove|delete|×/i).click();
    });
  });
});
