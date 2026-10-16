import { cleanupE2eData, trackCreated } from '../support/cleanup'
import { loginViaUi, waitForHydration } from '../support/login'

describe('Admin posts — publish dialog (never publishes)', () => {
  // Runs whether the tests passed or failed.
  after(() => {
    cleanupE2eData()
  })
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
  })

  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('match', /\/admin\/posts\/?$/)
    waitForHydration()
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  // E2E tests run against the real database and must never publish: this
  // only checks the publish dialog and cancels it.
  it('offers the publish options and keeps the post a draft when cancelled', () => {
    const uid = `${commitHash}-${Date.now()}`
    const enTitle = `e2e publish dialog ${uid}`
    const esTitle = `e2e dialogo publicar ${uid}`
    trackCreated('posts', enTitle)
    trackCreated('posts', esTitle)

    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    // Fill EN
    cy.get('[data-testid="title-input"]').type(enTitle)
    cy.get('[data-testid="category-select"]').find('.select__control').click()
    cy.contains('.select__option', /other/i).click()
    cy.get('[data-testid="excerpt-input"]').type('e2e publish dialog test')
    cy.get('[data-testid="content-input"]').type('e2e publish dialog content')

    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 20000 }).should('not.include', '/new')

    // Fill ES
    cy.get('[data-testid="locale-tab-es"]').click()
    cy.get('[data-testid="title-input"]').type(esTitle)
    cy.get('[data-testid="excerpt-input"]').type('e2e test dialogo publicar')
    cy.get('[data-testid="content-input"]').type('e2e test contenido dialogo')

    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()

    // Open the publish dialog, check its options, then cancel.
    cy.get('[data-testid="publish-button"]').should('not.be.disabled').click()
    cy.get('[data-testid="publish-notify-publish-only"]').should('be.visible')
    cy.get('[data-testid="publish-notify-publish-and-notify"]').should(
      'be.visible',
    )
    cy.get('[data-testid="publish-notify-cancel"]').click()
    cy.get('[data-testid="publish-notify-publish-only"]').should('not.exist')
    cy.get('[data-testid="status-badge"]').should('contain.text', 'Draft')
  })
})

describe('Admin posts — create, archive, and hard delete', () => {
  // Runs whether the tests passed or failed.
  after(() => {
    cleanupE2eData()
  })
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
  })

  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('match', /\/admin\/posts\/?$/)
    waitForHydration()
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('creates a post with both locales, archives it, then permanently deletes it', () => {
    const uid = `${commitHash}-${Date.now()}`
    const enTitle = `e2e post ${uid}`
    const esTitle = `e2e post es ${uid}`
    trackCreated('posts', enTitle)
    trackCreated('posts', esTitle)

    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    // Fill EN fields
    cy.get('[data-testid="title-input"]').type(enTitle)
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

    // Go back to posts list and refresh to load the new post
    cy.intercept('GET', /\/api\/posts/).as('postsList')
    cy.get('[data-testid="back-link"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="refresh-button"]').click()
    cy.wait('@postsList')

    // Archive the post — disappears from 'all' tab via optimistic cache update
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="archive-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()

    // Post no longer visible in 'all' tab
    cy.contains('[data-testid="post-row"]', enTitle).should('not.exist')

    // Switch to archived tab — post appears
    cy.get('[data-testid="filter-archived"]').click()
    cy.contains('[data-testid="post-row"]', enTitle, { timeout: 10000 }).should(
      'be.visible',
    )

    // Hard delete the archived post
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="hard-delete-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()

    // Post permanently deleted — no longer in archived tab
    cy.contains('[data-testid="post-row"]', enTitle).should('not.exist')
  })
})
