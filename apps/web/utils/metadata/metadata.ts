export const sharedRootMetadata = (language: string) => ({
  title: 'Saúl de León Guerrero',
  colorScheme: 'dark',
  metadataBase: new URL('https://www.sawl.dev'),
  alternates: {
    canonical: `/${language}`,
    languages: {
      'en-US': '/en',
      'en-UK': '/en',
      'es-ES': '/es',
    },
  },
})
