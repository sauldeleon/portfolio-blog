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
}

export const sharedRootViewport: Viewport = {
  colorScheme: 'dark',
}
