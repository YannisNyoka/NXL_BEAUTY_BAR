describe('Booking Page Flow', () => {
  const API_URL = 'http://13.48.199.77:3001';

  beforeEach(() => {
    // Clear any previous state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Mock API responses with exact patterns
    cy.intercept('GET', `${API_URL}/api/appointments`, {
      statusCode: 200,
      body: { 
        success: true, 
        data: [] 
      }
    }).as('appointments');

    cy.intercept('GET', `${API_URL}/api/services`, {
      statusCode: 200,
      body: { 
        success: true, 
        data: [
          { id: '1', name: 'Manicure', price: 150, duration: '45 min' },
          { id: '2', name: 'Pedicure', price: 100, duration: '20 min' },
          { id: '3', name: 'Lashes', price: 120, duration: '30 min' },
          { id: '4', name: 'Tinting', price: 80, duration: '20 min' }
        ]
      }
    }).as('services');

    // Mock login API response
    cy.intercept('POST', `${API_URL}/api/user/signin`, {
      statusCode: 200,
      body: { 
        success: true, 
        message: 'Login successful',
        user: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          contactNumber: '1234567890'
        }
      }
    }).as('loginRequest');

    // Visit login page and perform login
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('TestPass123!');
    cy.get('button').contains('Sign In').click();
    
    // Wait for login to complete and redirect to dashboard
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    
    // Wait for dashboard to load
    cy.contains('Welcome!', { timeout: 10000 }).should('be.visible');
  });

  it('should allow service selection', () => {
    cy.contains('.service-item', 'Lashes').should('be.visible').click();
    cy.contains('.service-item', 'Lashes').should('have.class', 'selected');
  });

  it('should allow multiple service selection', () => {
    cy.contains('.service-item', 'Lashes').click();
    cy.contains('.service-item', 'Tinting').click();
    cy.get('.service-item.selected').should('have.length', 2);
  });

  it('should allow service deselection', () => {
    cy.contains('.service-item', 'Lashes').click();
    cy.contains('.service-item', 'Lashes').should('have.class', 'selected');
    cy.contains('.service-item', 'Lashes').click();
    cy.contains('.service-item', 'Lashes').should('not.have.class', 'selected');
  });

  it('should allow date selection', () => {
    // Find and click an available (non-empty) date
    cy.get('.calendar-day')
      .not('.empty')
      .first()
      .should('be.visible')
      .click();
    
    cy.get('.calendar-day.selected').should('exist');
  });

  it('should allow time selection', () => {
    // Select an available time slot
    cy.get('.time-slot')
      .not('.booked')
      .contains('12:00 pm')
      .should('be.visible')
      .click();
    
    cy.get('.time-slot.selected').should('exist');
  });

  it('should allow stylist selection', () => {
    cy.contains('.employee-item', 'Noxolo').should('be.visible').click();
    cy.contains('.employee-item', 'Noxolo').should('have.class', 'selected');
  });

  it('should show manicure type dropdown when manicure selected', () => {
    cy.contains('.service-item', 'Manicure').click();
    cy.get('#manicure-type').should('be.visible');
    cy.get('#manicure-type option').should('have.length.greaterThan', 1);
  });

  it('should show pedicure type dropdown when pedicure selected', () => {
    cy.contains('.service-item', 'Pedicure').click();
    cy.get('#pedicure-type').should('be.visible');
    cy.get('#pedicure-type option').should('have.length.greaterThan', 1);
  });

  it('should validate required fields before booking', () => {
    const stub = cy.stub();
    cy.on('window:alert', stub);
    
    cy.contains('button', 'BOOK APPOINTMENT')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub).to.be.calledOnce;
        expect(stub.firstCall.args[0]).to.include('Please select');
      });
  });

  it('should open booking summary with valid selections', () => {
    // Select service
    cy.contains('.service-item', 'Lashes').click();
    
    // Select date
    cy.get('.calendar-day').not('.empty').first().click();
    
    // Select time
    cy.get('.time-slot').not('.booked').contains('12:00 pm').click();
    
    // Click book appointment
    cy.contains('button', 'BOOK APPOINTMENT').click();
    
    // Check if modal/summary appears
    cy.get('.booking-summary-modal, [class*="summary"]', { timeout: 5000 })
      .should('exist');
  });
});