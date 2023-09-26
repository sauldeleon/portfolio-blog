import { getTitle } from '../support/common.po'

describe('Contact page', () => {
  beforeEach(() => {
    cy.visit('/contact/')
  })

  it('should redirect to the contact page with language', () => {
    cy.location('pathname').should('eq', '/en/contact/')
  })

  it('should show my name', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
  })

  it('should show an image carousel', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.get('h3').should('have.text', 'Software Engineer')
    cy.get('[alt="My profile picture 1"]').should('have.css', 'opacity', '1')
    cy.get('[alt="My profile picture 2"]').should('have.css', 'opacity', '0')
    cy.get('[alt="My profile picture 2"]', { timeout: 60000 }).should(
      'have.css',
      'opacity',
      '1',
    )
  })

  it('should show a hidden image', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.get('h3').should('have.text', 'Software Engineer')
    cy.get('[alt="My profile picture 1"]').as('btn').click({ force: true })
    cy.get('[alt="My toothless profile picture"]')
  })
})
