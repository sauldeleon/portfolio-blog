/**
 * @vitest-environment node
 */
import type { BackendModule } from 'i18next'

const { mockCreateInstance, mockInit } = vi.hoisted(() => ({
  mockCreateInstance: vi.fn(),
  mockInit: vi.fn(),
}))

vi.mock('i18next', () => ({ createInstance: mockCreateInstance }))
vi.mock('react-i18next/initReactI18next', () => ({ initReactI18next: {} }))
vi.mock('@sdlgr/i18n-config', () => ({
  getOptions: (options: unknown) => options,
}))

function fakeInstance() {
  const instance = {
    use: vi.fn(() => instance),
    init: mockInit,
    getFixedT: vi.fn(
      (lng: string, ns: unknown, keyPrefix?: string) =>
        `t:${lng}:${String(ns)}:${keyPrefix ?? ''}`,
    ),
  }
  return instance
}

const preferences = (language?: string) => ({
  language,
  fallbackLng: 'en',
  defaultNS: 'common',
  languages: ['en', 'es'],
  resourcesToBackend: {} as BackendModule<object>,
})

describe('useServerTranslation', () => {
  beforeEach(async () => {
    vi.resetModules()
    mockCreateInstance.mockImplementation(fakeInstance)
    mockInit.mockResolvedValue(undefined)
  })

  async function load() {
    return (await import('./i18n-server')).useServerTranslation
  }

  it('returns a translator fixed to the requested language', async () => {
    const useServerTranslation = await load()
    const { t } = await useServerTranslation(preferences('es'), 'blogPage', {
      keyPrefix: 'comments',
    })
    expect(t).toBe('t:es:blogPage:comments')
  })

  it('falls back to the default language', async () => {
    const useServerTranslation = await load()
    const { t } = await useServerTranslation(preferences(), 'common')
    expect(t).toBe('t:en:common:')
  })

  it('works without a namespace', async () => {
    const useServerTranslation = await load()
    const { t } = await useServerTranslation(preferences('en'))
    expect(t).toBe('t:en:undefined:')
  })

  it('reuses one instance per language and namespace set', async () => {
    const useServerTranslation = await load()
    await useServerTranslation(preferences('en'), 'common')
    await useServerTranslation(preferences('en'), 'common')
    await useServerTranslation(preferences('en'), ['common', 'footer'] as never)
    await useServerTranslation(preferences('es'), 'common')
    expect(mockCreateInstance).toHaveBeenCalledTimes(3)
  })

  it('does not keep an instance whose initialisation failed', async () => {
    const useServerTranslation = await load()
    mockInit.mockRejectedValueOnce(new Error('load failed'))
    await expect(
      useServerTranslation(preferences('en'), 'common'),
    ).rejects.toThrow('load failed')
    await useServerTranslation(preferences('en'), 'common')
    expect(mockCreateInstance).toHaveBeenCalledTimes(2)
  })
})
