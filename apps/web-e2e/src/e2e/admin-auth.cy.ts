const USERNAME = Cypress.env('ADMIN_USERNAME') ?? 'admin'
const PASSWORD = Cypress.env('ADMIN_PASSWORD') ?? 'admin'

function login(username = USERNAME, password = PASSWORD) {
  cy.visit('/admin/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password)
  cy.get('[data-testid="login-form"]').submit()
}

describe('Admin auth — unauthenticated access', () => {
  it('redirects /admin/posts to login when not authenticated', () => {
    cy.visit('/admin/posts')
    cy.url().should('include', '/admin/login')
  })

  it('redirects /admin/categories to login when not authenticated', () => {
    cy.visit('/admin/categories')
    cy.url().should('include', '/admin/login')
  })

  it('allows visiting /admin/login without auth', () => {
    cy.visit('/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })
})

describe('Admin auth — login', () => {
  it('shows error on invalid credentials', () => {
    login('admin', 'wrongpassword')
    cy.get('[role="alert"]').should('contain.text', 'Invalid credentials')
    cy.url().should('include', '/admin/login')
  })

  it('redirects to /admin/posts after successful login', () => {
    login()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })
})

describe('Admin auth — logout', () => {
  beforeEach(() => {
    login()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
  })

  it('redirects to /admin/login after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url().should('include', '/admin/login', { timeout: 10000 })
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('cannot access /admin/posts after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url().should('include', '/admin/login', { timeout: 10000 })

    cy.visit('/admin/posts')
    cy.url().should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('cannot access /admin/categories after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url().should('include', '/admin/login', { timeout: 10000 })

    cy.visit('/admin/categories')
    cy.url().should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })
})
