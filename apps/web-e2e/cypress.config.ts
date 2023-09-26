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
  },
})
