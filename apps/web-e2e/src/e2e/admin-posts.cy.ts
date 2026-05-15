import { loginViaUi } from '../support/login'

describe('Admin posts — create and archive', () => {
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

  it('creates a post with both locales and then archives it', () => {
    const uid = `${commitHash}-${Date.now()}`
    const enTitle = `e2e post ${uid}`
    const esTitle = `e2e post es ${uid}`

    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    // Fill EN fields
    cy.get('[data-testid="title-input"]').type(enTitle)
    cy.get('label[for="author-use-default"]').click()
    cy.get('[data-testid="author-input"]').clear()
    cy.get('[data-testid="author-input"]').type('e2e')
    cy.get('[data-testid="category-select"]').find('.select__control').click()
    cy.contains('.select__option', /other/i).click()
    cy.get('[data-testid="excerpt-input"]').type('an e2e test post')
    cy.get('[data-testid="content-input"]').type('an e2e test post')

    // Save EN → navigates to edit page
    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 20000 }).should('not.include', '/new')

    // Switch to ES tab and fill fields
    cy.get('[data-testid="locale-tab-es"]').click()
    cy.get('[data-testid="title-input"]').type(esTitle)
    cy.get('[data-testid="excerpt-input"]').type('an e2e test post es')
    cy.get('[data-testid="content-input"]').type('an e2e test post es')

    // Save ES
    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()

    // Both locales saved — publish button should be enabled
    cy.get('[data-testid="publish-button"]').should('not.be.disabled')

    // Go back to posts list
    cy.intercept('GET', /\/api\/posts/).as('postsList')
    cy.get('[data-testid="back-link"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="refresh-button"]').click()
    cy.wait('@postsList')

    // Archive the post — stays in list as archived (optimistic update)
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="delete-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()

    // Post still visible, now shows unarchive button
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="unarchive-button"]')
      .should('be.visible')

    // Unarchive → row reverts to draft, then archive again for cleanup
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="unarchive-button"]')
      .click()
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="delete-button"]')
      .should('be.visible')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()
  })
})
