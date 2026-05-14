import { slugify } from './slugify'

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

  it('preserves unicode letters', () => {
    expect(slugify('Montañismo')).toBe('montañismo')
  })
})
