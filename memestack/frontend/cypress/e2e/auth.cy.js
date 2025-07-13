// End-to-End Test: User Authentication Flow
// Tests complete user registration and login workflow

describe('User Authentication Flow', () => {
  const testUser = {
    username: 'cypresstest',
    email: 'cypress@test.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should allow user to register successfully', () => {
      // Navigate to register page
      cy.contains('Get Started').click();
      cy.url().should('include', '/register');

      // Fill out registration form
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);

      // Submit registration
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard after successful registration
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome to MemeStack').should('be.visible');
    });

    it('should show validation errors for invalid data', () => {
      cy.visit('/register');

      // Try to submit with empty form
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.contains('Username is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate password strength', () => {
      cy.visit('/register');

      // Fill form with weak password
      cy.get('input[name="username"]').type('testuser');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('123');
      cy.get('input[name="confirmPassword"]').type('123');

      cy.get('button[type="submit"]').click();

      // Should show password validation error
      cy.contains('Password must be at least 8 characters').should('be.visible');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Register a user first for login tests
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, testUser);
    });

    it('should allow user to login successfully', () => {
      // Navigate to login page
      cy.contains('Login').click();
      cy.url().should('include', '/login');

      // Fill out login form
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);

      // Submit login
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard after successful login
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome back').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');

      // Fill form with invalid credentials
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');

      cy.get('button[type="submit"]').click();

      // Should show error message
      cy.contains('Invalid credentials').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should validate required fields', () => {
      cy.visit('/login');

      // Try to submit with empty form
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Register and login user
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, testUser)
        .then((response) => {
          window.localStorage.setItem('token', response.body.data.token);
          window.localStorage.setItem('user', JSON.stringify(response.body.data.user));
        });
    });

    it('should allow user to logout successfully', () => {
      cy.visit('/dashboard');

      // Click logout button
      cy.get('[data-testid="user-menu"]').click();
      cy.contains('Logout').click();

      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Get Started').should('be.visible');

      // Should clear local storage
      cy.window().its('localStorage').invoke('getItem', 'token').should('be.null');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected route without authentication
      cy.visit('/dashboard');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should allow authenticated users to access protected routes', () => {
      // Login user first
      cy.request('POST', `${Cypress.env('apiUrl')}/auth/register`, testUser)
        .then((response) => {
          window.localStorage.setItem('token', response.body.data.token);
          window.localStorage.setItem('user', JSON.stringify(response.body.data.user));
        });

      cy.visit('/dashboard');

      // Should successfully access dashboard
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome').should('be.visible');
    });
  });
});
