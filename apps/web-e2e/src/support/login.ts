const E2E_EMAIL = 'e2e@e2e.com'

export function loginViaUi(
  email = E2E_EMAIL,
  password: string = Cypress.env('E2E_PASSWORD'),
) {
  cy.visit('/admin/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password, { log: false })
  cy.get('[data-testid="login-form"]').submit()
}
