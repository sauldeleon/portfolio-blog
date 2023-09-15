import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    screenshotOnRunFailure: true,
    screenshotsFolder: 'screenshots',
    baseUrl: 'http://localhost:4200',
  },
  defaultCommandTimeout: 5000,
  modifyObstructiveCode: false,
  experimentalStudio: true,
})
