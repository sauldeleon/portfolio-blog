const USERNAME = Cypress.env('ADMIN_USERNAME') ?? 'admin'
const PASSWORD = Cypress.env('ADMIN_PASSWORD') ?? 'admin'

function loginViaUi(username = USERNAME, password = PASSWORD) {
  cy.visit('/admin/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password, { log: false })
  cy.get('[data-testid="login-form"]').submit()
}

function waitForLogout() {
  cy.request({ url: '/api/auth/me', failOnStatusCode: false })
    .its('status')
    .should('eq', 401)
}

function loginWithSession(username = USERNAME, password = PASSWORD) {
  cy.session(
    ['admin-session', username],
    () => {
      loginViaUi(username, password)
      cy.url({ timeout: 20000 }).should('include', '/admin/posts')
      cy.get('[data-testid="admin-nav"]').should('be.visible')
    },
    {
      validate: () => {
        cy.request({ url: '/api/auth/me', failOnStatusCode: false })
          .its('status')
          .should('eq', 200)
      },
    },
  )
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
    loginViaUi('admin', 'wrongpassword')
    cy.get('[role="alert"]').should('contain.text', 'Invalid credentials')
    cy.url().should('include', '/admin/login')
  })

  it('redirects to /admin/posts after successful login', () => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })
})

describe('Admin auth — logout', () => {
  beforeEach(() => {
    loginWithSession()
    cy.visit('/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('redirects to /admin/login after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('cannot access /admin/posts after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    waitForLogout()

    cy.visit('/admin/posts')
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('cannot access /admin/categories after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    waitForLogout()

    cy.visit('/admin/categories')
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })
})
