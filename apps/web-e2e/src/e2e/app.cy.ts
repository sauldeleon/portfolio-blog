import { getTitle } from '../support/app.po'

describe('web', () => {
  beforeEach(() => cy.visit('/'))

  it('should display my name', () => {
    getTitle({ timeout: 6000 }).contains('Saúl de León Guerrero')
  })
})
