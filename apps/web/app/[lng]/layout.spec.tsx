import { screen } from '@testing-library/react'
import React from 'react'

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
    renderApp(<RootLayout params={{ lng: 'en' }}>test</RootLayout>)

    expect(await screen.findByText('test')).toBeInTheDocument()
    expect(screen.getByTestId('root-html')).toHaveAttribute('lang', 'en')
  })

  it('should render successfully in Spanish', async () => {
    renderApp(<RootLayout params={{ lng: 'es' }}>test</RootLayout>)

    expect(await screen.findByText('test')).toBeInTheDocument()
    expect(screen.getByTestId('root-html')).toHaveAttribute('lang', 'es')
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
    })
  })
  it('should generate viewport data successfully', async () => {
    expect(viewport).toEqual({
      colorScheme: 'dark',
    })
  })
})
