import { getNextLanguage } from './client'

describe('client', () => {
  it.each`
    language     | expected
    ${undefined} | ${'en'}
    ${'en'}      | ${'es'}
    ${'es'}      | ${'en'}
  `('should get next language for $language', ({ language, expected }) => {
    expect(getNextLanguage(language)).toBe(expected)
  })
})
