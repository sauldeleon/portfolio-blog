import { getTitle } from '../support/common.po'

describe('Experience page - SEO', () => {
  beforeEach(() => cy.visit('/experience/'))

  it('should have BreadcrumbList JSON-LD', () => {
    cy.get('script[type="application/ld+json"]').then((scripts) => {
      const schemas = scripts
        .toArray()
        .map((s) => JSON.parse(s.innerText ?? s.textContent ?? '{}'))
      const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList')
      expect(breadcrumb).to.not.equal(undefined)
      expect(breadcrumb.itemListElement).to.have.length(2)
      expect(breadcrumb.itemListElement[0].name).to.equal('Home')
      expect(breadcrumb.itemListElement[1].name).to.equal('Experience')
    })
  })
})

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
