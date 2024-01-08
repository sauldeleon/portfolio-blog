import { getTitle } from '../support/common.po'

describe('Portfolio page', () => {
  beforeEach(() => {
    cy.visit('/portfolio/')
  })

  it('should redirect to the portfolio page with language', () => {
    cy.location('pathname').should('eq', '/en/portfolio/')
  })

  it('should show render title', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
  })

  it('should show render scroll to top button and move to top', () => {
    cy.get('[data-testid=scrollColumn]').should('have.css', 'opacity', '0')
    cy.scrollTo(0, 1500)
    cy.get('[data-testid=scrollColumn]').should('have.css', 'opacity', '1')
    cy.get('[data-testid=scrollToTop]').click()
    cy.window().its('scrollY').should('equal', 0)
    cy.get('[data-testid=scrollColumn]').should('have.css', 'opacity', '0')
  })
})
