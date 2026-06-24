module.exports = {
  displayName: 'gpx-map',
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
  coverageDirectory: '../../coverage/libs/gpx-map',
  moduleNameMapper: {
    '\\.css$': require.resolve('identity-obj-proxy'),
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'GpxMap\\.styles\\.ts',
    '\\.d\\.ts$',
  ],
}
