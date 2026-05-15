const USERNAME = Cypress.env('ADMIN_USERNAME') ?? 'admin'
const PASSWORD = Cypress.env('ADMIN_PASSWORD') ?? 'admin'

export function loginViaUi(username = USERNAME, password = PASSWORD) {
  cy.visit('/admin/login')
  cy.get('#username').type(username)
  cy.get('#password').type(password, { log: false })
  cy.get('[data-testid="login-form"]').submit()
}
