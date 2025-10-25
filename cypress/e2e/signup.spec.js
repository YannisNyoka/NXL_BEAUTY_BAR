const API_URL = 'http://13.48.199.77:3001';

describe('Signup Flow', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('allows a user to sign up with valid details', () => {
    const timestamp = Date.now();
    const validUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `cypress.user.${timestamp}@example.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
    };

    // Intercept the signup request
    cy.intercept('POST', `${API_URL}/api/users`).as('signupRequest');

    // Fill out and submit the form
    cy.get('input[name="firstName"]').type(validUser.firstName);
    cy.get('input[name="lastName"]').type(validUser.lastName);
    cy.get('input[name="email"]').type(validUser.email);
    cy.get('input[name="password"]').type(validUser.password);
    cy.get('input[name="confirmPassword"]').type(validUser.confirmPassword);
    
    // Submit form
    cy.get('button[type="submit"]').click();

    // Should redirect away from signup
    cy.url({ timeout: 10000 }).should('not.include', '/signup');
    
    // Wait for redirect and success state
    cy.wait(1000); // Give time for the redirect to complete
    cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
      const text = $body.text().toLowerCase();
      return text.includes('success') || 
             text.includes('welcome') || 
             text.includes('dashboard') ||
             text.includes('account created');
    });
  });

  it('shows validation errors when required fields are missing', () => {
    // Submit the empty form
    cy.get('button[type="submit"]').click();

    // Form should stay on signup page
    cy.url().should('include', '/signup');

    // Try to submit with a short password
    const shortPwdData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short'
    };
    
    cy.get('input[name="firstName"]').type(shortPwdData.firstName);
    cy.get('input[name="lastName"]').type(shortPwdData.lastName);
    cy.get('input[name="email"]').type(shortPwdData.email);
    cy.get('input[name="password"]').type(shortPwdData.password);
    cy.get('input[name="confirmPassword"]').type(shortPwdData.confirmPassword);
    
    cy.get('button[type="submit"]').click();
    
    // Should show password validation message
    cy.contains(/password.*8 characters/i).should('be.visible');
  });

  it('prevents duplicate signups with the same email', () => {
    const timestamp = Date.now();
    cy.fixture('user').then((user) => {
      const email = `cypress.duplicate.${timestamp}@example.com`;
      const userData = {
        ...user,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        confirmPassword: user.password,
      };

      // First signup should succeed
      cy.signupUI(userData);
      cy.contains(/welcome|account created|success/i, { timeout: 10000 }).should('be.visible');

      // Attempt to signup again with same email
      cy.signupUI(userData);

      // Expect an error message about duplicate email
      cy.contains(/already exists|already registered|duplicate/i, { timeout: 10000 }).should('be.visible');
    });
  });

  it('validates password requirements', () => {
    cy.fixture('user').then((user) => {
      const timestamp = Date.now();
      const email = `cypress.pwd.${timestamp}@example.com`;
      
      // Test short password
      const shortPwdData = {
        ...user,
        email,
        firstName: 'Test',
        lastName: 'User',
        password: 'short',
        confirmPassword: 'short'
      };
      cy.get('input[name="firstName"]').type(shortPwdData.firstName);
      cy.get('input[name="lastName"]').type(shortPwdData.lastName);
      cy.get('input[name="email"]').type(shortPwdData.email);
      cy.get('input[name="password"]').type(shortPwdData.password);
      cy.get('input[name="confirmPassword"]').type(shortPwdData.confirmPassword);
      cy.get('button[type="submit"]').click();
      
      // Check for password validation message
      cy.contains('Password must be at least 8 characters and contain uppercase, lowercase, and a number', { timeout: 10000 }).should('be.visible');

      // Test password mismatch
      cy.get('input[name="password"]').clear().type('ValidPass123!');
      cy.get('input[name="confirmPassword"]').clear().type('DifferentPass123!');
      cy.get('button[type="submit"]').click();
      
      // Check for password mismatch validation
      cy.contains('Passwords do not match', { timeout: 10000 }).should('be.visible');
    });
  });
});
