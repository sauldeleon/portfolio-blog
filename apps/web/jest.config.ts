const nextFontMock =
  require.resolve('next/dist/build/jest/__mocks__/nextFontMock.js')

module.exports = {
  displayName: 'web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setupafterenv.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/lib/db/schema\\.ts',
    '<rootDir>/lib/db/migrations/',
    '<rootDir>/lib/types/',
  ],
  moduleNameMapper: {
    'next/font/(.*)': nextFontMock,
    '^@react-pdf/renderer$': '<rootDir>/__mocks__/react-pdf-renderer.tsx',
  },
}
