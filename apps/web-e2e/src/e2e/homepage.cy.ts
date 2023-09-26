import { checkLocalStorageValue, getTitle } from '../support/common.po'

describe('Home page', () => {
  beforeEach(() => cy.visit('/'))

  it('should display my name', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.location('pathname').should('eq', '/en/')
  })

  it('should maintain the last selected language', () => {
    cy.location('pathname').should('eq', '/en/')

    cy.get('footer').within(() => {
      cy.get(`[aria-label="Toggle language. Current language is English."]`)
        .should('have.text', 'EN')
        .click()
    })
    cy.location('pathname').should('eq', '/es/')

    cy.visit('/')
    cy.location('pathname').should('eq', '/es/')
    checkLocalStorageValue('webLng', 'es')
    cy.get('footer').within(() => {
      cy.get(
        `[aria-label="Alternar idioma. El idioma actual es Español."]`,
      ).should('have.text', 'ES')
    })
  })

  it('should show the cookie banner and close it on click', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.get('.CookieConsent').within(() => {
      cy.root().contains(
        'This website uses cookies to ensure you get the best experience.',
      )
      cy.get('button').contains('Accept').click()
      cy.get('button').should('not.exist')
    })
  })

  it('should show the cookie banner and close it on scroll down', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.get('.CookieConsent').within(() => {
      cy.root().contains(
        'This website uses cookies to ensure you get the best experience.',
      )
      cy.scrollTo(0, 1000)
      cy.get('button').should('not.exist')
    })
  })

  it('should not show the cookie banner', () => {
    cy.setCookie('cookie-consent', 'true')
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
    cy.get('.CookieConsent').should('not.exist')
  })
})
