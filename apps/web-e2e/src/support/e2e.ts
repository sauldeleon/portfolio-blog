// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Uncaught exception', err, runnable.body)
  return false
})

/**
 * E2E tests must never publish or schedule a post: they run against the real
 * database, and publishing can email subscribers and expose the post on the
 * blog, RSS and sitemap. Every request that would publish or schedule a post
 * is answered with a 403 before it reaches the app, and the running test fails
 * (as a test failure, so the specs' after() cleanup hooks still run).
 */
beforeEach(() => {
  cy.intercept(
    { method: /^(POST|PUT|PATCH)$/, url: /\/api\/posts\// },
    (req) => {
      let body = req.body
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body)
        } catch {
          body = {}
        }
      }
      if (body?.status === 'published' || body?.scheduledAt) {
        req.reply({
          statusCode: 403,
          body: {
            error: 'e2e guard: publishing posts is not allowed in e2e tests',
          },
        })
        throw new Error(
          `e2e guard: blocked an attempt to publish or schedule a post (${req.method} ${req.url})`,
        )
      }
    },
  )
})
