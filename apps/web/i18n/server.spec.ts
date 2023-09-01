import { getServerTranslation, useServerTranslation } from './server'

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
  }),
}))

describe('Server Translation service', () => {
  it('useServerTranslation should translate correctly', async () => {
    const { t } = await useServerTranslation()
    expect(t('aboutMe')).toEqual('aboutMe')
  })

  it('getServerTranslation should translate correctly', async () => {
    const { t } = await getServerTranslation()
    expect(t('aboutMe')).toEqual('aboutMe')
  })
})
