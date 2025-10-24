describe('Products / Cart Flow', () => {
  beforeEach(() => {
    // Create and login a user before cart tests
    const timestamp = Date.now();
    cy.fixture('user').then((user) => {
      const email = `cypress.cart.${timestamp}@example.com`;
      const userData = {
        ...user,
        email,
        password: user.password,
      };
      cy.signupUI(userData);
      cy.loginUI(email, user.password);
    });
  });

  it('adds an item to the cart and it appears in the cart', () => {
    const productName = 'Manicure';
    const productPrice = 50; // Adjust based on your actual price

    // Add product and verify success message
    cy.addProductToCart(productName);
    cy.contains(/added to cart|item added/i).should('be.visible');

    // Open cart and verify contents
    cy.get('a[href="/cart"], .cart-icon, button[aria-label="cart"]').click({ force: true });
    
    // Verify product details in cart
    cy.contains(productName).should('be.visible');
    cy.contains(productPrice.toString()).should('be.visible');
    cy.get('[data-cy="quantity"], .quantity, input[type="number"]').should('have.value', '1');
  });

  it('increments quantity when adding same product multiple times', () => {
    const productName = 'Manicure';

    // Add the same product twice
    cy.addProductToCart(productName);
    cy.addProductToCart(productName);

    // Open cart and verify quantity
    cy.get('a[href="/cart"], .cart-icon, button[aria-label="cart"]').click({ force: true });
    
    cy.contains(productName)
      .closest('tr, li, .cart-item')
      .within(() => {
        cy.get('[data-cy="quantity"], .quantity, input[type="number"]')
          .should('have.value', '2');
      });
  });

  it('allows removing items from cart', () => {
    const productName = 'Manicure';
    
    // Add product
    cy.addProductToCart(productName);
    
    // Open cart
    cy.get('a[href="/cart"], .cart-icon, button[aria-label="cart"]').click({ force: true });
    
    // Remove item
    cy.contains(productName)
      .closest('tr, li, .cart-item')
      .within(() => {
        cy.get('button').contains(/remove|delete|×/i).click();
      });
    
    // Verify item is removed
    cy.contains(productName).should('not.exist');
    cy.contains(/empty|no items/i).should('be.visible');
  });

  it('calculates total price correctly', () => {
    const product1 = {
      name: 'Manicure',
      price: 50
    };
    const product2 = {
      name: 'Pedicure',
      price: 60
    };

    // Add products
    cy.addProductToCart(product1.name);
    cy.addProductToCart(product2.name);

    // Open cart
    cy.get('a[href="/cart"], .cart-icon, button[aria-label="cart"]').click({ force: true });

    // Verify total (adjust selector based on your app)
    cy.get('[data-cy="cart-total"], .cart-total, .total')
      .contains((product1.price + product2.price).toString())
      .should('be.visible');
  });
});
