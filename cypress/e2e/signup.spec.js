describe('Signup Flow', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('allows a user to sign up with valid details', () => {
    const timestamp = Date.now();
    cy.fixture('user').then((user) => {
      const email = `cypress.user.${timestamp}@example.com`;
      const userData = {
        ...user,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        confirmPassword: user.password,
      };

      cy.signupUI(userData);

      // Verify success message
      cy.contains(/welcome|account created|success/i, { timeout: 10000 }).should('be.visible');
      
      // Verify redirect
      cy.url().should('eq', 'http://localhost:3000/');
      
      // Verify user data is displayed correctly
      cy.contains(userData.firstName).should('be.visible');
      cy.contains(userData.lastName).should('be.visible');
    });
  });

  it('shows validation errors when required fields are missing', () => {
    cy.visit('/signup');
    // submit empty form
    cy.get('button[type="submit"]').click();

    // Expect validation errors - adapt selectors as needed
    cy.get('input[name="email"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist');
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
      
      // Check for password length validation
      cy.contains('password length too short', { timeout: 10000 }).should('be.visible');

      // Test password mismatch
      cy.get('input[name="password"]').clear().type('ValidPass123!');
      cy.get('input[name="confirmPassword"]').clear().type('DifferentPass123!');
      cy.get('button[type="submit"]').click();
      
      // Check for password mismatch validation
      cy.contains('Passwords do not match', { timeout: 10000 }).should('be.visible');
    });
  });
});
