import '@testing-library/cypress/add-commands'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * cy.visit, then wait until the page has hydrated. Pages are
       * server-rendered, so their buttons are on screen before React attaches
       * event handlers and an early click is silently lost. MainLayout sets
       * `data-hydrated` on <html> once hydration is done.
       */
      visitHydrated(
        url: string,
        options?: Partial<Cypress.VisitOptions>,
      ): Chainable<void>
    }
  }
}

Cypress.Commands.add(
  'visitHydrated',
  (url: string, options?: Partial<Cypress.VisitOptions>) => {
    cy.visit(url, options)
    cy.get('html[data-hydrated="true"]', { timeout: 20000, log: false })
  },
)
