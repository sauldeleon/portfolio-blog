import { loginViaUi } from '../support/login'

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
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
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
    cy.clearAllCookies()
    cy.clearLocalStorage()

    cy.visit('/admin/posts')
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('cannot access /admin/categories after logout', () => {
    cy.contains('button', 'Logout').click()
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.clearAllCookies()
    cy.clearLocalStorage()

    cy.visit('/admin/categories')
    cy.url({ timeout: 15000 }).should('include', '/admin/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })
})
