describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('shows an error for invalid credentials', () => {
    cy.loginUI('nonexistent@example.com', 'wrongpassword');
    cy.contains(/invalid|incorrect|not found/i, { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('shows validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[name="email"]:invalid').should('exist');
    cy.get('input[name="password"]:invalid').should('exist');
  });

  it('shows error for invalid email format', () => {
    cy.loginUI('invalidemail', 'somepassword');
    cy.get('input[name="email"]:invalid').should('exist');
  });

  it('allows a user to login with valid credentials', () => {
    // Create a user via UI first (we rely on signup to work)
    const timestamp = Date.now();
    cy.fixture('user').then((user) => {
      const email = `cypress.login.${timestamp}@example.com`;
      const userData = {
        ...user,
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        confirmPassword: user.password,
      };

      cy.signupUI(userData);
      cy.contains(/welcome|account created|success/i, { timeout: 10000 }).should('be.visible');

      // Now login
      cy.loginUI(email, user.password);

      // Verify successful login
      cy.url({ timeout: 10000 }).should('not.include', '/login');
      cy.contains(user.firstName, { timeout: 10000 }).should('be.visible');

      // Verify persistence of login state
      cy.reload();
      cy.contains(user.firstName, { timeout: 10000 }).should('be.visible');
    });
  });
});
