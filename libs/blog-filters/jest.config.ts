module.exports = {
  displayName: 'blog-filters',
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
  coverageDirectory: '../../coverage/libs/blog-filters',
  moduleNameMapper: {
    'next/navigation':
      require.resolve('./src/lib/__mocks__/next-navigation.ts'),
  },
}
