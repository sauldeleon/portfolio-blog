import { loginViaUi } from '../support/login'

describe('Admin cards — canyon waypoints generator', () => {
  beforeEach(() => {
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  it('renders a preview from the canyon waypoints tab', () => {
    cy.visit('/admin/cards')
    cy.get('[data-testid="card-generator"]').should('be.visible')

    cy.get('[data-testid="card-type-canyon-waypoints"]').click()
    cy.get('[data-testid="canyon-waypoints-generator"]').should('be.visible')

    // No preview until the textarea has valid waypoints.
    cy.get('[data-testid="card-preview"]').should('not.exist')

    cy.get('[data-testid="cw-text"]').type(
      'salto: Jump 2m - 42.6092 0.1412{enter}- Bend on landing{enter}---{enter}rapel: Rappel 10m - 42.6056 0.1294',
    )

    cy.get('[data-testid="card-preview"]').should('be.visible')
    cy.get('[data-testid="svg-container"] svg').should('exist')
  })
})
