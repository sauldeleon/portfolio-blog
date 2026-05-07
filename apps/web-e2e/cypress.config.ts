import { defineConfig } from 'cypress'

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
      const webpackPreprocessor = require('@cypress/webpack-preprocessor')
      on(
        'file:preprocessor',
        webpackPreprocessor({
          webpackOptions: {
            resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
            module: {
              rules: [
                {
                  test: /\.tsx?$/,
                  use: [
                    {
                      loader: 'ts-loader',
                      options: {
                        transpileOnly: true,
                        configFile: require.resolve('./tsconfig.json'),
                      },
                    },
                  ],
                  exclude: /node_modules/,
                },
              ],
            },
          },
        }),
      )
    },
  },
})
