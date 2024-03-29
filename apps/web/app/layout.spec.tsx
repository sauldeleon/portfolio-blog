import { render, screen } from '@testing-library/react'

import RootLayout, { generateMetadata, viewport } from './layout.next'

describe('RootLayout', () => {
  it('should render children', async () => {
    render(<RootLayout>test</RootLayout>)
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})

describe('/ route - metadata', () => {
  it('should generate metadata successfully', async () => {
    expect(await generateMetadata()).toEqual({
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
