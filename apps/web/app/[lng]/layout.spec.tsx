import { act, screen } from '@testing-library/react'
import React, { Suspense } from 'react'

import { renderApp } from '@sdlgr/test-utils'

import RootLayout, {
  generateMetadata,
  generateStaticParams,
  viewport,
} from './layout.next'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn().mockImplementation(() => '/en'),
  useParams: jest.fn().mockImplementation(() => ({ lng: 'en' })),
  useSelectedLayoutSegments: () => ['(home)'],
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock(
  '@web/components/MainLayout/components/ProgressBar/ProgressBar',
  () => ({
    ProgressBar: () => 'ProgressBar',
  }),
)

describe('[lng] route - layout', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((err, attr1) => {
      if (
        typeof err === 'string' &&
        err.includes('validateDOMNesting') &&
        attr1?.includes('html')
      ) {
        return
      }
    })
  })
  it('should render successfully in English', async () => {
    // act needed to flush React.use() Suspense resolution after Promise.resolve()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderApp(
        <Suspense fallback={null}>
          <RootLayout params={Promise.resolve({ lng: 'en' })}>test</RootLayout>
        </Suspense>,
      )
    })

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })

  it('should render successfully in Spanish', async () => {
    // act needed to flush React.use() Suspense resolution after Promise.resolve()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderApp(
        <Suspense fallback={null}>
          <RootLayout params={Promise.resolve({ lng: 'es' })}>test</RootLayout>
        </Suspense>,
      )
    })

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'es')
  })
})

describe('[lng] route - static params', () => {
  it('should generate static params successfully', async () => {
    const params = await generateStaticParams()
    expect(params).toEqual([
      {
        lng: 'en',
      },
      {
        lng: 'es',
      },
    ])
  })
})

describe('[lng] route - metadata', () => {
  it('should generate metadata successfully', async () => {
    expect(await generateMetadata({ params: { lng: 'en' } })).toEqual({
      title: 'Saúl de León Guerrero',
      description: 'My personal Portfolio',
      metadataBase: expect.any(Object),
      alternates: {
        languages: {
          'en-UK': '/en',
          'en-US': '/en',
          'es-ES': '/es',
        },
      },
      openGraph: {
        type: 'website',
        siteName: 'Saúl de León Guerrero',
        images: [
          {
            url: '/assets/portrait.jpg',
            width: 800,
            height: 800,
            alt: 'Saúl de León Guerrero',
          },
        ],
      },
      twitter: {
        card: 'summary',
        images: ['/assets/portrait.jpg'],
      },
      robots: {
        index: true,
        follow: true,
      },
    })
  })
  it('should generate viewport data successfully', async () => {
    expect(viewport).toEqual({
      colorScheme: 'dark',
    })
  })
})
