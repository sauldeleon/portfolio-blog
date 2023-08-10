const nxPreset = require('@nx/jest/preset').default
const path = require('path')

/** @type {import('@nx/jest/preset').nxPreset} */
module.exports = {
  ...nxPreset,
  setupFilesAfterEnv: [path.resolve(__dirname, 'jest.setupafterenv.ts')],
}
