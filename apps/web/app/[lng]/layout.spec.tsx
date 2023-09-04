import { screen } from '@testing-library/react'
import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import RootLayout, {
  generateMetadata,
  generateStaticParams,
} from './layout.next'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('[lng] route - layout', () => {
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
      colorScheme: 'dark',
      metadataBase: expect.any(Object),
      alternates: {
        canonical: '/en',
        languages: {
          'en-UK': '/en',
          'en-US': '/en',
          'es-ES': '/es',
        },
      },
    })
  })
})
