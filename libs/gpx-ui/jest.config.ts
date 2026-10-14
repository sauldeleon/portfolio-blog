module.exports = {
  displayName: 'gpx-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [['@nx/react/babel', { runtime: 'automatic' }]],
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/gpx-ui',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.styles\\.ts$',
    '\\.d\\.ts$',
  ],
}
