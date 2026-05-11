import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata, revalidate } from './page.next'

describe('[lng]/portfolio route -  page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'en' }) }),
    )
    expect(baseElement).toBeTruthy()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'es' }) }),
    )
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng]/portfolio - revalidate', () => {
  it('should export revalidate as 86400', () => {
    expect(revalidate).toBe(86400)
  })
})

describe('[lng]/portfolio - Metadata', () => {
  it('should set the correct metadata for English', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      title: 'Portfolio',
      description:
        'Portfolio of Saúl de León Guerrero. CV download, project showcase and technology stack. Front-End Engineer specialising in React and TypeScript.',
      alternates: {
        canonical: 'https://www.sawl.dev/en/portfolio/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/portfolio/',
          'en-GB': 'https://www.sawl.dev/en/portfolio/',
          'es-ES': 'https://www.sawl.dev/es/portfolio/',
          'x-default': 'https://www.sawl.dev/en/portfolio/',
        },
      },
      openGraph: {
        url: 'https://www.sawl.dev/en/portfolio/',
        locale: 'en_US',
        alternateLocale: ['es_ES'],
      },
    })
  })

  it('should set the correct metadata for Spanish', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'es' }) }),
    ).toEqual({
      title: 'Portfolio',
      description:
        'Portfolio de Saúl de León Guerrero. Descarga del CV, muestra de proyectos y stack tecnológico. Ingeniero Front-End especializado en React y TypeScript.',
      alternates: {
        canonical: 'https://www.sawl.dev/es/portfolio/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/portfolio/',
          'en-GB': 'https://www.sawl.dev/en/portfolio/',
          'es-ES': 'https://www.sawl.dev/es/portfolio/',
          'x-default': 'https://www.sawl.dev/en/portfolio/',
        },
      },
      openGraph: {
        url: 'https://www.sawl.dev/es/portfolio/',
        locale: 'es_ES',
        alternateLocale: ['en_US'],
      },
    })
  })
})
