import { loginViaUi } from '../support/login'

// 1×1 transparent PNG — minimal valid image accepted by the upload API
const MINIMAL_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('Admin images — upload, verify in picker, delete', () => {
  let imageName: string
  let commitHash: string

  before(() => {
    cy.task<string>('getCommitHash').then((hash) => {
      commitHash = hash
    })
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
  })

  it('uploads an image, verifies it in the post editor image picker, then deletes it', () => {
    const ts = Date.now()
    imageName = `e2e-cypress-${commitHash}-${ts}`
    const renamedImageName = `e2e-cypress-${commitHash}-${ts + 10000}`

    // 1. Go to image manager
    cy.visit('/admin/images')
    cy.get('[data-testid="image-manager"]').should('be.visible')

    // 2. Open upload modal
    cy.get('[data-testid="upload-button"]').click()
    cy.get('[data-testid="dropzone"]').should('be.visible')

    // 3. Drop the image file
    cy.get('[data-testid="dropzone-input"]').selectFile(
      {
        contents: Cypress.Buffer.from(MINIMAL_PNG_B64, 'base64'),
        fileName: `${imageName}.png`,
        mimeType: 'image/png',
      },
      { force: true },
    )

    // 4. Set custom name and upload
    cy.get('[data-testid="selected-filename"]').should('be.visible')
    cy.get('[data-testid="name-input"]').clear()
    cy.get('[data-testid="name-input"]').type(imageName)
    cy.get('[data-testid="upload-submit-button"]').click()

    // 5. Verify image appears in the grid
    cy.get('[data-testid="image-grid"]', { timeout: 20000 }).should(
      'be.visible',
    )
    cy.get(`[title="sawl.dev - blog/${imageName}"]`).should('be.visible')

    // 5b. Rename the image
    cy.get(`[title="sawl.dev - blog/${imageName}"]`)
      .closest('[data-testid="image-card"]')
      .find('[data-testid="edit-button"]')
      .click()
    cy.get('[data-testid="rename-input"]').clear()
    cy.get('[data-testid="rename-input"]').type(renamedImageName)
    cy.get('[data-testid="rename-save-button"]').click()
    cy.get(`[title="sawl.dev - blog/${renamedImageName}"]`, {
      timeout: 20000,
    }).should('be.visible')

    // 6. Navigate to new post editor.
    // Intercept the images API call that fires after React hydration so we
    // know event handlers are attached before clicking the picker button.
    cy.intercept('GET', '/api/images/').as('pickerHydration')
    cy.visit('/admin/posts/new')
    cy.get('[data-testid="post-editor"]').should('be.visible')
    cy.wait('@pickerHydration')

    // 7. Open image picker sidebar.
    // Use native HTMLElement.click() — React's event delegation handles it
    // correctly where Cypress's synthetic click sometimes does not.
    cy.get('[data-testid="open-image-picker-button"]').scrollIntoView()
    cy.get('[data-testid="open-image-picker-button"]').then(($el) => {
      $el[0].click()
    })
    // Wait for the 0.3s slide-in transition to complete before interacting
    cy.get('[data-testid="image-picker-sidebar"]').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    )

    // 8. Search for the renamed image.
    // force: true bypasses Cypress's elementFromPoint overlap check which
    // can false-positive on position:fixed elements inside other fixed ancestors
    cy.get('[data-testid="image-picker-search"]').type(renamedImageName, {
      force: true,
    })
    cy.get('[data-testid="image-picker-item"]', { timeout: 20000 }).should(
      'have.length.at.least',
      1,
    )
    cy.get('[data-testid="image-name"]').should(
      'contain.text',
      renamedImageName,
    )

    // 9. Go back to image manager without creating a post
    cy.visit('/admin/images')
    cy.get('[data-testid="image-manager"]').should('be.visible')
    cy.get('[data-testid="image-grid"]', { timeout: 20000 }).should(
      'be.visible',
    )

    // 10. Delete the renamed image
    cy.get(`[title="sawl.dev - blog/${renamedImageName}"]`)
      .closest('[data-testid="image-card"]')
      .find('[data-testid="delete-button"]')
      .click()

    cy.get('[data-testid="confirm-delete-confirm"]').click()

    // 11. Verify image is gone
    cy.get(`[title="sawl.dev - blog/${renamedImageName}"]`).should('not.exist')
  })
})
