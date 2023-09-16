export const getTitle = (options?: Parameters<typeof cy.get>[1]) =>
  cy.get('h1', options)
