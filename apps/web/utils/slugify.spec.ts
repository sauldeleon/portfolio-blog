import { isPostSlug, slugify } from './slugify'

describe('slugify', () => {
  it('lowercases input', () => {
    expect(slugify('Engineering')).toBe('engineering')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
  })

  it('collapses multiple spaces into one hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('hello--world')).toBe('hello-world')
  })

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world')
  })

  it('handles numbers', () => {
    expect(slugify('Top 10 Tips')).toBe('top-10-tips')
  })

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('')
  })

  it('returns empty string for input with only special chars', () => {
    expect(slugify('!@#$%')).toBe('')
  })

  it('preserves existing valid slugs', () => {
    expect(slugify('my-category')).toBe('my-category')
  })

  it('strips diacritics from unicode letters', () => {
    expect(slugify('Montañismo')).toBe('montanismo')
  })

  it('strips accented vowels', () => {
    expect(slugify('Góriz')).toBe('goriz')
  })
})

describe('isPostSlug', () => {
  it('accepts what slugify produces', () => {
    expect(isPostSlug(slugify('Del Valle de Pineta a Tucarroya'))).toBe(true)
    expect(isPostSlug('ruta-2026')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isPostSlug('')).toBe(false)
    expect(isPostSlug('Has spaces')).toBe(false)
    expect(isPostSlug('double--hyphen')).toBe(false)
    expect(isPostSlug('-leading')).toBe(false)
    expect(isPostSlug('a/b')).toBe(false)
    expect(isPostSlug('a'.repeat(201))).toBe(false)
  })
})
