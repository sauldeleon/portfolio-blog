import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng] route - Page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'en' }) }),
    )
    const items = await screen.findAllByRole('presentation')
    expect(items).toHaveLength(2)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'es' }) }),
    )
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng] route - Metadata', () => {
  it('should set canonical and og:url for English', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      alternates: {
        canonical: 'https://www.sawl.dev/en/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/',
          'en-GB': 'https://www.sawl.dev/en/',
          'es-ES': 'https://www.sawl.dev/es/',
          'x-default': 'https://www.sawl.dev/en/',
        },
      },
      openGraph: { url: 'https://www.sawl.dev/en/', locale: 'en_US' },
    })
  })

  it('should set canonical and og:url for Spanish', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'es' }) }),
    ).toEqual({
      alternates: {
        canonical: 'https://www.sawl.dev/es/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/',
          'en-GB': 'https://www.sawl.dev/en/',
          'es-ES': 'https://www.sawl.dev/es/',
          'x-default': 'https://www.sawl.dev/en/',
        },
      },
      openGraph: { url: 'https://www.sawl.dev/es/', locale: 'es_ES' },
    })
  })
})
