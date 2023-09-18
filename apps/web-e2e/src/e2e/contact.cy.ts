import { getTitle } from '../support/common.po'

describe('Contact page', () => {
  beforeEach(() => {
    cy.visit('/en/contact/')
  })

  it('should display my name', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.location('pathname').should('eq', '/en/contact/')
  })
})
