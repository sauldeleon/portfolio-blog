const E2E_EMAIL = 'e2e@e2e.com'

export function loginViaUi(email = E2E_EMAIL, password?: string) {
  cy.visitHydrated('/admin/login')
  cy.get('#email').type(email)
  const typePassword = (value: string) =>
    cy.get('#password').type(value, { log: false })
  if (password !== undefined) {
    typePassword(password)
  } else {
    cy.env(['E2E_PASSWORD']).then(({ E2E_PASSWORD }) =>
      typePassword(E2E_PASSWORD),
    )
  }
  cy.get('[data-testid="login-form"]').submit()
}

/**
 * Logging in reloads the page on /admin/posts, which is server-rendered:
 * wait for React to hydrate it before clicking anything.
 */
export function waitForHydration() {
  cy.get('html[data-hydrated="true"]', { timeout: 20000, log: false })
}
