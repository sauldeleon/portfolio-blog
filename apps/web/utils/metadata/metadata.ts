import { Metadata, Viewport } from 'next'

export const sharedRootMetadata: Metadata = {
  title: 'Saúl de León Guerrero',
  metadataBase: new URL('https://www.sawl.dev'),
  alternates: {
    languages: {
      'en-US': '/en',
      'en-UK': '/en',
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
}

export const sharedRootViewport: Viewport = {
  colorScheme: 'dark',
}
