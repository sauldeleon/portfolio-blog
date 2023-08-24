import { screen } from '@testing-library/react'
import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import RootLayout from './layout.next'

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
