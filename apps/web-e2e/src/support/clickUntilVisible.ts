/**
 * Clicks `trigger` until `target` is visible.
 *
 * On freshly loaded pages a click can be lost: the element may be rendered
 * before React attaches its handlers, or React may replace the node while it
 * recovers from a hydration mismatch. `cy.get` re-queries the trigger on every
 * retry, so the click always lands on the node currently in the DOM.
 */
export function clickUntilVisible(
  trigger: string,
  target: string,
  timeout = 15000,
) {
  cy.get(trigger, { timeout }).should(($trigger) => {
    if (Cypress.$(target).filter(':visible').length === 0) {
      $trigger[0].click()
    }
    expect(Cypress.$(target).filter(':visible')).to.have.length.at.least(1)
  })
  cy.get(target).should('be.visible')
}
