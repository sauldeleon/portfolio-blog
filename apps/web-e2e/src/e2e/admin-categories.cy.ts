import { loginViaUi } from '../support/login'

describe('Admin categories — create and delete', () => {
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
  })

  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('creates a category and then deletes it', () => {
    const name = `e2e-cat-${commitHash}-${Date.now()}`

    cy.visit('/admin/categories/new')
    cy.url({ timeout: 10000 }).should('include', '/admin/categories/new')

    cy.get('[data-testid="name-input"]').type(name)
    cy.get('[data-testid="slug-input"]').should('not.have.value', '')
    cy.get('[data-testid="submit-button"]').should('not.be.disabled').click()

    cy.url({ timeout: 20000 }).should('include', '/admin/categories')
    cy.url().should('not.include', '/new')

    cy.contains('[data-testid="category-row"]', name)
      .find('[data-testid="delete-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()

    cy.contains('[data-testid="category-row"]', name).should('not.exist')
  })
})
