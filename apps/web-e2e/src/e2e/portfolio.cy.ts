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

describe('Portfolio page - Download CV button', () => {
  it('should render the download button with English label', () => {
    cy.visit('/en/portfolio/')
    cy.get('[aria-label="Download a copy of the CV"]').should('exist')
  })

  it('should be disabled initially and become enabled once PDF is ready', () => {
    cy.visit('/en/portfolio/')
    cy.get('[aria-label="Download a copy of the CV"]', {
      timeout: 15000,
    }).should('not.be.disabled')
  })

  it('should trigger download with English filename on click', () => {
    cy.visit('/en/portfolio/')
    cy.get('[aria-label="Download a copy of the CV"]', {
      timeout: 15000,
    }).should('not.be.disabled')

    cy.window().then((win) => {
      cy.stub(win.document.body, 'removeChild').returns(
        win.document.body as unknown as Node,
      )
      const appendStub = cy
        .stub(win.document.body, 'appendChild')
        .callsFake(() => null)

      cy.get('[aria-label="Download a copy of the CV"]').click()

      cy.wrap(appendStub).should(
        'have.been.calledWith',
        Cypress.sinon.match(
          (el: HTMLElement) =>
            el.tagName === 'A' &&
            (el as HTMLAnchorElement).download ===
              'CV-SaulDeLeonGuerrero-en.pdf',
        ),
      )
    })
  })

  it('should render the download button with Spanish label', () => {
    cy.visit('/es/portfolio/')
    cy.get('[aria-label="Descargar una copia del CV"]').should('exist')
  })

  it('should trigger download with Spanish filename on click', () => {
    cy.visit('/es/portfolio/')
    cy.get('[aria-label="Descargar una copia del CV"]', {
      timeout: 15000,
    }).should('not.be.disabled')

    cy.window().then((win) => {
      cy.stub(win.document.body, 'removeChild').returns(
        win.document.body as unknown as Node,
      )
      const appendStub = cy
        .stub(win.document.body, 'appendChild')
        .callsFake(() => null)

      cy.get('[aria-label="Descargar una copia del CV"]').click()

      cy.wrap(appendStub).should(
        'have.been.calledWith',
        Cypress.sinon.match(
          (el: HTMLElement) =>
            el.tagName === 'A' &&
            (el as HTMLAnchorElement).download ===
              'CV-SaulDeLeonGuerrero-es.pdf',
        ),
      )
    })
  })
})
