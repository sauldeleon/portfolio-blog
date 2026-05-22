import { loginViaUi } from '../support/login'

describe('Admin posts — publish lifecycle', () => {
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
  })

  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('match', /\/admin\/posts\/?$/)
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('publishes a post, verifies the blog page, then unpublishes, archives, and hard deletes', () => {
    const uid = `${commitHash}-${Date.now()}`
    const enTitle = `e2e publish ${uid}`
    const esTitle = `e2e publicar ${uid}`

    cy.get('[data-testid="new-post-button"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts/new')

    // Fill EN
    cy.get('[data-testid="title-input"]').type(enTitle)
    cy.get('[data-testid="category-select"]').find('.select__control').click()
    cy.contains('.select__option', /other/i).click()
    cy.get('[data-testid="excerpt-input"]').type('e2e publish test')
    cy.get('[data-testid="content-input"]').type('e2e publish test content')

    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()
    cy.url({ timeout: 20000 }).should('not.include', '/new')
    cy.url().as('postEditorUrl')

    // Fill ES
    cy.get('[data-testid="locale-tab-es"]').click()
    cy.get('[data-testid="title-input"]').type(esTitle)
    cy.get('[data-testid="excerpt-input"]').type('e2e test publicar')
    cy.get('[data-testid="content-input"]').type('e2e test contenido publicar')

    cy.get('[data-testid="save-button"]').should('not.be.disabled').click()

    // Publish from editor — wait for PUT response
    cy.intercept('PUT', /\/api\/posts\//).as('publishReq')
    cy.get('[data-testid="publish-button"]').should('not.be.disabled').click()
    cy.wait('@publishReq').its('response.statusCode').should('eq', 200)
    cy.get('[data-testid="status-badge"]', { timeout: 10000 }).should(
      'contain.text',
      'Published',
    )

    // Capture EN blog post URL
    cy.get('[data-testid="locale-tab-en"]').click()
    cy.get('[data-testid="preview-tab-card"]').click()
    cy.contains('a', 'Read more')
      .should('have.attr', 'href')
      .and('not.eq', '#')
      .as('enPostUrl')

    // Verify the published blog post is accessible
    cy.get<string>('@enPostUrl').then((enUrl) => {
      cy.visit(enUrl)
      cy.get('h1').should('contain.text', `e2e publish ${uid}`)
    })

    // Back to admin posts table
    cy.visit('/admin/posts/')
    cy.contains('[data-testid="post-row"]', enTitle, { timeout: 10000 }).should(
      'be.visible',
    )

    // Navigate directly to editor via captured URL and unpublish
    cy.get<string>('@postEditorUrl').then((editorUrl) => {
      cy.visit(editorUrl)
    })
    cy.url({ timeout: 10000 }).should('match', /\/admin\/posts\/[^/]+\/?$/)
    cy.intercept('PUT', /\/api\/posts\//).as('unpublishReq')
    cy.get('[data-testid="unpublish-button"]').should('not.be.disabled').click()
    cy.wait('@unpublishReq').its('response.statusCode').should('eq', 200)
    cy.get('[data-testid="status-badge"]', { timeout: 10000 }).should(
      'contain.text',
      'Draft',
    )

    // Back to table and archive the now-draft post
    cy.intercept('GET', /\/api\/posts/).as('postsRefresh')
    cy.get('[data-testid="back-link"]').click()
    cy.url({ timeout: 10000 }).should('include', '/admin/posts')
    cy.get('[data-testid="refresh-button"]').click()
    cy.wait('@postsRefresh')
    cy.contains('[data-testid="post-row"]', enTitle, { timeout: 10000 }).should(
      'be.visible',
    )
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="archive-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()
    cy.contains('[data-testid="post-row"]', enTitle).should('not.exist')

    // Switch to archived tab
    cy.get('[data-testid="filter-archived"]').click()
    cy.contains('[data-testid="post-row"]', enTitle, { timeout: 10000 }).should(
      'be.visible',
    )

    // Hard delete
    cy.contains('[data-testid="post-row"]', enTitle)
      .find('[data-testid="hard-delete-button"]')
      .click()
    cy.get('[data-testid="confirm-delete-confirm"]').click()
    cy.contains('[data-testid="post-row"]', enTitle).should('not.exist')
  })
})

describe('Admin posts — create, archive, and hard delete', () => {
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
  })

  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('match', /\/admin\/posts\/?$/)
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('creates a post with both locales, archives it, then permanently deletes it', () => {
    const uid = `${commitHash}-${Date.now()}`
    const enTitle = `e2e post ${uid}`
    const esTitle = `e2e post es ${uid}`

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
