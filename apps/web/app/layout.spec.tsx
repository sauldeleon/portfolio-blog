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
