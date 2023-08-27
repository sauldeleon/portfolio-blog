import { screen } from '@testing-library/react'
import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import RootLayout, {
  generateMetadata,
  generateStaticParams,
} from './layout.next'

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
  }),
}))

describe('[lng] route - layout', () => {
  it('should render successfully in English', async () => {
    renderApp(<RootLayout params={{ lng: 'en' }}>test</RootLayout>)

    const text = await screen.findByText('test')
    expect(text).toBeInTheDocument()
    expect(screen.getByTestId('root-html')).toHaveAttribute('lang', 'en')
  })

  it('should render successfully in Spanish', async () => {
    renderApp(<RootLayout params={{ lng: 'es' }}>test</RootLayout>)

    const text = await screen.findByText('test')
    expect(text).toBeInTheDocument()
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
  it('should generate static params successfully', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Saúl de León Guerrero',
      description: 'My personal Portfolio',
      colorScheme: 'dark',
      metadataBase: expect.any(Object),
      alternates: {
        canonical: '/es',
        languages: {
          'en-UK': '/en',
          'es-ES': '/es',
          'en-US': '/en',
        },
      },
    })
  })
})
