import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata } from './page.next'

describe('[lng]/blog route -  page', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<Page />)
    expect(baseElement).toBeTruthy()
  })
})

describe('[lng]/blog - Metadata', () => {
  it('should set the correct metadata for English', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      title: 'Blog',
      robots: { index: false, follow: false },
      alternates: {
        canonical: 'https://www.sawl.dev/en/blog/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/blog/',
          'en-GB': 'https://www.sawl.dev/en/blog/',
          'es-ES': 'https://www.sawl.dev/es/blog/',
          'x-default': 'https://www.sawl.dev/en/blog/',
        },
      },
    })
  })

  it('should set the correct metadata for Spanish', async () => {
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'es' }) }),
    ).toEqual({
      title: 'Blog',
      robots: { index: false, follow: false },
      alternates: {
        canonical: 'https://www.sawl.dev/es/blog/',
        languages: {
          'en-US': 'https://www.sawl.dev/en/blog/',
          'en-GB': 'https://www.sawl.dev/en/blog/',
          'es-ES': 'https://www.sawl.dev/es/blog/',
          'x-default': 'https://www.sawl.dev/en/blog/',
        },
      },
    })
  })
})
