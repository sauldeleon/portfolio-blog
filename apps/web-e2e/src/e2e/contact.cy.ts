import { getTitle } from '../support/common.po'

describe('Contact page - SEO', () => {
  beforeEach(() => cy.visit('/contact/'))

  it('should have BreadcrumbList JSON-LD', () => {
    cy.get('script[type="application/ld+json"]').then((scripts) => {
      const schemas = scripts
        .toArray()
        .map((s) => JSON.parse(s.innerText ?? s.textContent ?? '{}'))
      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).to.not.equal(undefined)
      expect(breadcrumb.itemListElement).to.have.length(2)
      expect(breadcrumb.itemListElement[0].name).to.equal('Home')
      expect(breadcrumb.itemListElement[1].name).to.equal('Contact')
    })
  })

  it('should have ContactPage JSON-LD with Person mainEntity', () => {
    cy.get('script[type="application/ld+json"]').then((scripts) => {
      const schemas = scripts
        .toArray()
        .map((s) => JSON.parse(s.innerText ?? s.textContent ?? '{}'))
      const contactPage = schemas.find((s) => s['@type'] === 'ContactPage')
      expect(contactPage).to.not.equal(undefined)
      expect(contactPage.mainEntity['@type']).to.equal('Person')
      expect(contactPage.mainEntity.name).to.equal('Saúl de León Guerrero')
    })
  })
})

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
