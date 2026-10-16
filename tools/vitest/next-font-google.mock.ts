// ESM replacement for next/dist/build/jest/__mocks__/nextFontMock.js.
// Add an export here for every font imported from `next/font/google`.
const font = () => ({
  className: 'className',
  variable: 'variable',
  style: { fontFamily: 'fontFamily' },
})

export const Roboto_Mono = font
