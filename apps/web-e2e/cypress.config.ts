import { defineConfig } from 'cypress'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

function loadE2eEnvFile(projectRoot: string) {
  const loadEnvFile = (
    process as typeof process & { loadEnvFile?: (path: string) => void }
  ).loadEnvFile
  const envFilePath = join(projectRoot, '.env.e2e.local')

  if (existsSync(envFilePath) && loadEnvFile) {
    loadEnvFile(envFilePath)
  }
}

function getCypressEnv() {
  const env: Record<string, string> = {}
  const username =
    process.env.CYPRESS_ADMIN_USERNAME ?? process.env.ADMIN_USERNAME
  const password =
    process.env.CYPRESS_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD

  if (username) {
    env.ADMIN_USERNAME = username
  }

  if (password) {
    env.ADMIN_PASSWORD = password
  }

  return env
}

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
    setupNodeEvents(on, config) {
      const projectRoot = config.projectRoot

      loadE2eEnvFile(projectRoot)

      config.env = {
        ...config.env,
        ...getCypressEnv(),
      }

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
                        configFile: join(projectRoot, 'tsconfig.json'),
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

      return config
    },
  },
})
