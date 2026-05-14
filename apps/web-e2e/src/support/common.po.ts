export const getTitle = (options?: Parameters<typeof cy.get>[1]) =>
  cy.get('h1', options)

export const checkLocalStorageValue = (key: string, value: string) => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem(key)).to.eq(value)
  })
}
