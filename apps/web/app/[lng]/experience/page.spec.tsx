import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng]/experience route -  page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'en' }) }),
    )
    await screen.findByText('Experience')
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully in Spanish', async () => {
    const { baseElement } = renderApp(
      await Page({ params: Promise.resolve({ lng: 'es' }) }),
    )
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng]/experience - Metadata', () => {
  it('should set the correct metadata for English', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      title: 'Experience',
      description:
        'Work history of Saúl de León Guerrero — Front-End Engineer at Bonhams, Smart Protection, ING and more. 8+ years building React and TypeScript applications.',
      alternates: {
        canonical: 'https://www.sawl.dev/en/experience/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/experience/',
          'en-GB': 'https://www.sawl.dev/en/experience/',
          'es-ES': 'https://www.sawl.dev/es/experience/',
          'x-default': 'https://www.sawl.dev/en/experience/',
        },
      },
      openGraph: {
        url: 'https://www.sawl.dev/en/experience/',
        locale: 'en_US',
      },
    })
  })

  it('should set the correct metadata for Spanish', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'es' }) }),
    ).toEqual({
      title: 'Experiencia',
      description:
        'Historial profesional de Saúl de León Guerrero — Desarrollador Front-End en Bonhams, Smart Protection, ING y más. Más de 8 años desarrollando aplicaciones React y TypeScript.',
      alternates: {
        canonical: 'https://www.sawl.dev/es/experience/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/experience/',
          'en-GB': 'https://www.sawl.dev/en/experience/',
          'es-ES': 'https://www.sawl.dev/es/experience/',
          'x-default': 'https://www.sawl.dev/en/experience/',
        },
      },
      openGraph: {
        url: 'https://www.sawl.dev/es/experience/',
        locale: 'es_ES',
      },
    })
  })
})
