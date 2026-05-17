import { loginViaUi } from '../support/login'

describe('Admin posts — series order auto-assignment', () => {
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

  it('auto-assigns order 1 for first post in series and order 2 for second, then cleans up', () => {
    const uid = `${commitHash}-${Date.now()}`
    const seriesId = `e2e-series-${uid}`
    const firstTitle = `e2e series post 1 ${uid}`
    const secondTitle = `e2e series post 2 ${uid}`

    // --- Create first post ---
    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    cy.get('[data-testid="title-input"]').type(firstTitle)
    cy.get('label[for="author-use-default"]').click()
    cy.get('[data-testid="author-input"]').clear()
    cy.get('[data-testid="author-input"]').type('e2e')
    cy.get('[data-testid="category-select"]').find('.select__control').click()
    cy.contains('.select__option', /other/i).click()
    cy.get('[data-testid="excerpt-input"]').type('first post in series')
    cy.get('[data-testid="content-input"]').type('first post in series')

    // Create a new series ID using the creatable select
    cy.get('[data-testid="series-id-input"]').find('.select__control').click()
    cy.get('[data-testid="series-id-input"]').find('input').type(seriesId)
    cy.contains('.select__option', seriesId).click()

    // Fill series title
    cy.get('[data-testid="series-title-input"]').type(`E2E Series ${uid}`)

    // Order should be pre-filled with 1 (new series, no posts yet)
    cy.get('[data-testid="series-order-input"]').should('have.value', '1')

    // Save → navigates to edit page
    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 20000 }).should('not.include', '/new')

    // Go back to list
    cy.intercept('GET', /\/api\/posts/).as('postsList1')
    cy.get('[data-testid="back-link"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="refresh-button"]').click()
    cy.wait('@postsList1')

    // --- Create second post ---
    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    cy.get('[data-testid="title-input"]').type(secondTitle)
    cy.get('label[for="author-use-default"]').click()
    cy.get('[data-testid="author-input"]').clear()
    cy.get('[data-testid="author-input"]').type('e2e')
    cy.get('[data-testid="category-select"]').find('.select__control').click()
    cy.contains('.select__option', /other/i).click()
    cy.get('[data-testid="excerpt-input"]').type('second post in series')
    cy.get('[data-testid="content-input"]').type('second post in series')

    // Select the existing series from the dropdown
    cy.get('[data-testid="series-id-input"]').find('.select__control').click()
    cy.contains('.select__option', seriesId).click()

    // Order should be pre-filled with 2 (series already has 1 post)
    cy.get('[data-testid="series-order-input"]').should('have.value', '2')

    // Save
    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 20000 }).should('not.include', '/new')

    // Go back to list
    cy.intercept('GET', /\/api\/posts/).as('postsList2')
    cy.get('[data-testid="back-link"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="refresh-button"]').click()
    cy.wait('@postsList2')

    // --- Clean up: archive then hard-delete both posts ---
    for (const title of [firstTitle, secondTitle]) {
      cy.get('[data-testid="refresh-button"]').click()
      cy.get('[data-testid="filter-all"]').click()
      cy.contains('[data-testid="post-row"]', title)
        .find('[data-testid="archive-button"]')
        .click()
      cy.get('[data-testid="confirm-delete-confirm"]').click()
      cy.contains('[data-testid="post-row"]', title).should('not.exist')

      cy.get('[data-testid="filter-archived"]').click()
      cy.contains('[data-testid="post-row"]', title).should('be.visible')
      cy.contains('[data-testid="post-row"]', title)
        .find('[data-testid="hard-delete-button"]')
        .click()
      cy.get('[data-testid="confirm-delete-confirm"]').click()
      cy.contains('[data-testid="post-row"]', title).should('not.exist')
    }
  })
})
