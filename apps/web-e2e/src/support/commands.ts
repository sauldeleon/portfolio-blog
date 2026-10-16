import '@testing-library/cypress/add-commands'

/**
 * Pages are server-rendered, so their markup (buttons included) is on screen
 * before React attaches event handlers, and an early click is silently lost.
 * Every visit waits for the `data-hydrated` flag MainLayout sets on <html>
 * once the page has hydrated, and still yields the window like cy.visit.
 */
Cypress.Commands.overwrite('visit', (originalFn, ...args) =>
  originalFn(...args).then((win) =>
    cy
      .get('html[data-hydrated="true"]', { timeout: 20000, log: false })
      .then(() => win),
  ),
)
