import { loginViaUi } from '../support/login'

describe('Admin cards — canyon waypoints generator', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    loginViaUi()
    cy.url({ timeout: 20000 }).should('include', '/admin/posts')
    cy.get('[data-testid="admin-nav"]').should('be.visible')
  })

  // The tabs are a client component: the SSR'd markup is interactive-looking
  // before React hydrates, so an early click is a no-op. Retry the click until
  // the generator actually mounts, giving hydration a beat between attempts.
  const openCanyonWaypoints = (attempt = 0) => {
    cy.get('[data-testid="card-type-canyon-waypoints"]').click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="cw-text"]').length === 0 && attempt < 8) {
        openCanyonWaypoints(attempt + 1)
      }
    })
  }

  const openCroquis = (attempt = 0) => {
    cy.get('[data-testid="card-type-croquis"]').click()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="cg-text"]').length === 0 && attempt < 8) {
        openCroquis(attempt + 1)
      }
    })
  }

  it('renders a preview from the canyon waypoints tab', () => {
    cy.visit('/admin/cards')
    cy.get('[data-testid="card-generator"]', { timeout: 15000 }).should(
      'be.visible',
    )

    openCanyonWaypoints()

    cy.get('[data-testid="cw-text"]', { timeout: 15000 }).should('be.visible')
    // No preview until the textarea has valid waypoints.
    cy.get('[data-testid="card-preview"]').should('not.exist')

    // A single waypoint → a single preview card.
    cy.get('[data-testid="cw-text"]').type(
      'salto: Jump 2m - 42.6092 0.1412{enter}- Bend on landing',
    )

    cy.get('[data-testid="card-preview"]', { timeout: 15000 }).should(
      'be.visible',
    )
    cy.get('[data-testid="svg-container"] svg').should('exist')
  })
})
