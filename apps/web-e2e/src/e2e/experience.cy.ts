import { getTitle } from '../support/common.po'

describe('Experience page', () => {
  beforeEach(() => {
    cy.visit('/experience/')
  })

  it('should redirect to the experience page with language', () => {
    cy.location('pathname').should('eq', '/en/experience/')
  })

  it('should show multiple portals', () => {
    getTitle({ timeout: 6000 }).contains('Experience')
    cy.findAllByRole('presentation').should('have.length', 9)
  })
})
