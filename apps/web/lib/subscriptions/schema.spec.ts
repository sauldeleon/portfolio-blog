import { subscriptionDetailsSchema } from './schema'

describe('subscriptionDetailsSchema', () => {
  it('accepts a valid name and locale, trimming the name', () => {
    expect(
      subscriptionDetailsSchema.parse({ name: '  Ana  ', locale: 'es' }),
    ).toEqual({ name: 'Ana', locale: 'es' })
  })

  it('rejects a blank name', () => {
    expect(
      subscriptionDetailsSchema.safeParse({ name: '   ', locale: 'en' })
        .success,
    ).toBe(false)
  })

  it('rejects a name over 100 characters', () => {
    expect(
      subscriptionDetailsSchema.safeParse({
        name: 'a'.repeat(101),
        locale: 'en',
      }).success,
    ).toBe(false)
  })

  it('rejects an unknown locale', () => {
    expect(
      subscriptionDetailsSchema.safeParse({ name: 'Ana', locale: 'fr' })
        .success,
    ).toBe(false)
  })
})
