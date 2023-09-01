import { getServerTranslation, useServerTranslation } from './server'

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
