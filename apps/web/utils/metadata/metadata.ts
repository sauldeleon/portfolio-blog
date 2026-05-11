import { Metadata, Viewport } from 'next'

export const sharedRootMetadata: Metadata = {
  title: {
    default: 'Saúl de León Guerrero — Front-End Software Engineer',
    template: '%s | Saúl de León Guerrero',
  },
  metadataBase: new URL('https://www.sawl.dev'),
  alternates: {
    languages: {
      'en-US': '/en',
      'en-GB': '/en',
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
}

export const sharedRootViewport: Viewport = {
  colorScheme: 'dark',
}
