import { sharedRootMetadata } from './metadata'

describe('sharedMetadata', () => {
  it('should match snapshot', () => {
    expect(sharedRootMetadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "languages": {
            "en-UK": "/en",
            "en-US": "/en",
            "es-ES": "/es",
          },
        },
        "colorScheme": "dark",
        "metadataBase": "https://www.sawl.dev/",
        "title": "Saúl de León Guerrero",
      }
    `)
  })
})
