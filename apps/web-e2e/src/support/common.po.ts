export const getTitle = (options?: Parameters<typeof cy.get>[1]) =>
  cy.get('h1', options)

export const checkLocalStorageValue = (
  key: string,
  value: string,
  options?: Parameters<typeof cy.getAllLocalStorage>[0],
) => {
  cy.getAllLocalStorage(options).then((result) => {
    expect(result[Cypress.config().baseUrl as string]).to.deep.equal({
      [key]: value,
    })
  })
}
