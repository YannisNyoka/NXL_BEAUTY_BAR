// Custom Cypress commands for reuse

// Define API URL from Cypress environment
const API_URL = 'http://13.48.199.77:3001';

Cypress.Commands.add('signupUI', (user) => {
  cy.visit('/signup');
  if (user.firstName) cy.get('input[name="firstName"]').clear().type(user.firstName, { delay: 50 });
  if (user.lastName) cy.get('input[name="lastName"]').clear().type(user.lastName, { delay: 50 });
  if (user.email) cy.get('input[name="email"]').clear().type(user.email, { delay: 50 });
  if (user.password) cy.get('input[name="password"]').clear().type(user.password, { delay: 50 });
  if (user.confirmPassword) cy.get('input[name="confirmPassword"]').clear().type(user.confirmPassword, { delay: 50 });
  cy.get('button[type="submit"]').should('be.visible').and('be.enabled').click();
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
