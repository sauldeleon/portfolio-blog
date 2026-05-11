import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata, revalidate } from './page.next'

jest.mock('@sdlgr/use-is-bot', () => ({
  useIsBot: () => jest.fn().mockReturnValue({ isBot: false, isLoading: false }),
}))

describe('[lng]/contact - Page', () => {
  it('should render successfully', async () => {
    renderApp(await Page({ params: Promise.resolve({ lng: 'en' }) }))
    const text = await screen.findByText('Software Engineer')
    expect(text).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /My electronic mail address/i }),
    ).toBeInTheDocument()
  })
})

describe('[lng]/contact - revalidate', () => {
  it('should export revalidate as 86400', () => {
    expect(revalidate).toBe(86400)
  })
})

describe('[lng]/contact - Metadata', () => {
  it('should set the correct metadata for English', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      title: 'Contact',
      description:
        'Get in touch with Saúl de León Guerrero — Front-End Engineer based in Asturias, Spain. Connect via LinkedIn or email.',
      alternates: {
        canonical: 'https://www.sawl.dev/en/contact/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/contact/',
          'en-GB': 'https://www.sawl.dev/en/contact/',
          'es-ES': 'https://www.sawl.dev/es/contact/',
          'x-default': 'https://www.sawl.dev/en/contact/',
        },
      },
      openGraph: { url: 'https://www.sawl.dev/en/contact/', locale: 'en_US' },
    })
  })

  it('should set the correct metadata for Spanish', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'es' }) }),
    ).toEqual({
      title: 'Contacto',
      description:
        'Contacta con Saúl de León Guerrero — Desarrollador Front-End en Asturias, España. Conéctate por LinkedIn o correo electrónico.',
      alternates: {
        canonical: 'https://www.sawl.dev/es/contact/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/contact/',
          'en-GB': 'https://www.sawl.dev/en/contact/',
          'es-ES': 'https://www.sawl.dev/es/contact/',
          'x-default': 'https://www.sawl.dev/en/contact/',
        },
      },
      openGraph: { url: 'https://www.sawl.dev/es/contact/', locale: 'es_ES' },
    })
  })
})
