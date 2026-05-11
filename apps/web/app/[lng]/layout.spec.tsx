import { act, screen } from '@testing-library/react'
import { Suspense } from 'react'

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
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      document.querySelector(
        'link[rel="preconnect"][href="https://www.googletagmanager.com"]',
      ),
    ).not.toBeNull()
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      document.querySelector(
        'link[rel="dns-prefetch"][href="https://www.googletagmanager.com"]',
      ),
    ).not.toBeNull()
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
    expect(
      await generateMetadata({ params: Promise.resolve({ lng: 'en' }) }),
    ).toEqual({
      title: {
        default: 'Saúl de León Guerrero — Front-End Software Engineer',
        template: '%s | Saúl de León Guerrero',
      },
      description:
        'Front-End Software Engineer based in Asturias, Spain. Specialising in React, Next.js and TypeScript. Explore my portfolio and work history.',
      metadataBase: expect.any(Object),
      alternates: {
        languages: {
          'en-GB': '/en',
          'en-US': '/en',
          'es-ES': '/es',
          'x-default': '/en',
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
        card: 'summary_large_image',
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
