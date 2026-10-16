# Web E2E Tests

Cypress e2e test suite for the web app. Runs against localhost by default.

## Commands

```bash
yarn nx e2e web-e2e                                    # run all tests
yarn nx e2e web-e2e --spec src/e2e/homepage.cy.ts      # run single spec
```

## Folder Structure

```
src/
  /e2e/             # Test specs (*.cy.ts)
    homepage.cy.ts
    experience.cy.ts
    portfolio.cy.ts
    contact.cy.ts
  /support/         # Custom commands and setup
    e2e.ts          # Global setup
  /fixtures/        # Static test data
```

## Configuration

- Base URL: `http://localhost:4200`
- Config file: `cypress.config.ts`
- Screenshots on failure, no video

## Adding a New Test

1. Create `src/e2e/my-feature.cy.ts`
2. Use `cy.visit('/')` in `beforeEach`
3. Assert against the rendered UI
4. If the spec creates data, name it with an `e2e` prefix, register each name with `trackCreated(kind, name)` and add `after(() => cleanupE2eData())` (`src/support/cleanup.ts`). Cleanup deletes only those exact items, even when the test fails
5. To open a modal or panel on a freshly loaded page, use `clickUntilVisible(trigger, target)` instead of a single click
