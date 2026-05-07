import { defineConfig } from 'cypress'
import * as path from 'path'

export default defineConfig({
  e2e: {
    fileServerFolder: '.',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'src/fixtures',
    supportFile: 'src/support/e2e.ts',
    chromeWebSecurity: true,
    video: false,
    videosFolder: 'videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'screenshots',
    baseUrl: 'http://localhost:4200',
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true,
    setupNodeEvents(on) {
      const cypressVersion: string = require('cypress/package.json').version
      const binaryBase = path.join(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env['HOME']!,
        'Library/Caches/Cypress',
        cypressVersion,
        'Cypress.app/Contents/Resources/app/packages/server/node_modules',
      )

      const preprocessor = require(
        path.join(
          binaryBase,
          '@cypress/webpack-batteries-included-preprocessor',
        ),
      )

      const getWebpackOptions = preprocessor.getFullWebpackOptions

      on(
        'file:preprocessor',
        (file: {
          filePath: string
          outputPath: string
          shouldWatch: boolean
        }) => {
          const webpackOptions = getWebpackOptions(file.filePath, true)

          // Find the ts-loader rule and add ignoreDiagnostics
          const rules: Array<{
            use?: Array<{ loader?: string; options?: Record<string, unknown> }>
          }> = (webpackOptions?.module?.rules as typeof rules) || []
          for (const rule of rules) {
            if (!Array.isArray(rule.use)) continue
            const tsLoaderUse = rule.use.find((u) =>
              u.loader?.includes('ts-loader'),
            )
            if (tsLoaderUse) {
              tsLoaderUse.options = tsLoaderUse.options || {}
              ;(tsLoaderUse.options as Record<string, unknown>)[
                'ignoreDiagnostics'
              ] = [5011, 6059]
            }
          }

          const webpackPreprocessor = require(
            path.join(binaryBase, '@cypress/webpack-preprocessor'),
          )
          return webpackPreprocessor({ webpackOptions, typescript: true })(file)
        },
      )
    },
  },
})
