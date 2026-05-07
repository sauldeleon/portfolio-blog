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
