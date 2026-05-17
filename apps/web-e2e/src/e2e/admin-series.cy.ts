import { loginViaUi } from '../support/login'

describe('Admin series — create, edit, and delete', () => {
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
    cy.contains('[data-testid="admin-nav"] a', 'Series').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/series')
  })

  it('creates a series, edits its translations, then deletes it', () => {
    const uid = `${commitHash}-${Date.now()}`
    const seriesId = `e2e-series-${uid}`
    const enTitle = `E2E Series EN ${uid}`
    const esTitle = `E2E Serie ES ${uid}`
    const enTitleUpdated = `E2E Series EN Updated ${uid}`

    // --- Create new series ---
    cy.visit('/admin/series/new')
    cy.url({ timeout: 10000 }).should('include', '/admin/series/new')

    cy.get('[data-testid="en-title-input"]').type(enTitle)
    // ID auto-generated from EN title — override with our unique id
    cy.get('[data-testid="id-input"]').clear()
    cy.get('[data-testid="id-input"]').type(seriesId)
    cy.get('[data-testid="es-title-input"]').type(esTitle)

    cy.get('[data-testid="submit-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/series')

    // Series should appear in the table
    cy.get('[data-testid="refresh-button"]').click()
    cy.contains('[data-testid="series-row"]', seriesId).should('be.visible')

    // --- Edit EN title ---
    cy.contains('[data-testid="series-row"]', seriesId)
      .find('[data-testid="edit-button"]')
      .click()

    cy.get('[data-testid="locale-tab-en"]').should('be.visible')
    cy.get('[data-testid="edit-title-input"]').clear()
    cy.get('[data-testid="edit-title-input"]').type(enTitleUpdated)
    cy.get('[data-testid="save-button"]').click()

    // Updated title should be reflected
    cy.contains('[data-testid="series-row"]', enTitleUpdated).should(
      'be.visible',
    )

    // --- Edit ES title ---
    cy.contains('[data-testid="series-row"]', seriesId)
      .find('[data-testid="edit-button"]')
      .click()
    cy.get('[data-testid="locale-tab-es"]').click()
    cy.get('[data-testid="edit-title-input"]').clear()
    cy.get('[data-testid="edit-title-input"]').type(`${esTitle} Updated`)
    cy.get('[data-testid="save-button"]').click()

    // --- Delete the series ---
    cy.contains('[data-testid="series-row"]', seriesId)
      .find('[data-testid="delete-button"]')
      .should('not.be.disabled')
      .click()

    cy.get('[data-testid="confirm-delete-confirm"]').click()

    cy.contains('[data-testid="series-row"]', seriesId).should('not.exist')
  })
})
