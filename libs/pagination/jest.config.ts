module.exports = {
  displayName: 'pagination',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/pagination',
  moduleNameMapper: {
    'next/navigation':
      require.resolve('./src/lib/__mocks__/next-navigation.ts'),
  },
}
