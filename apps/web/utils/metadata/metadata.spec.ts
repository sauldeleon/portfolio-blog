import { sharedRootMetadata, sharedRootViewport } from './metadata'

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
        "metadataBase": "https://www.sawl.dev/",
        "title": "Saúl de León Guerrero",
      }
    `)
  })

  it('should match snapshot', () => {
    expect(sharedRootViewport).toMatchInlineSnapshot(`
      {
        "colorScheme": "dark",
      }
    `)
  })
})
