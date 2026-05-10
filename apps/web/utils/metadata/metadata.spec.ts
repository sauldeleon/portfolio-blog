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
        "openGraph": {
          "images": [
            {
              "alt": "Saúl de León Guerrero",
              "height": 800,
              "url": "/assets/portrait.jpg",
              "width": 800,
            },
          ],
          "siteName": "Saúl de León Guerrero",
          "type": "website",
        },
        "robots": {
          "follow": true,
          "index": true,
        },
        "title": "Saúl de León Guerrero",
        "twitter": {
          "card": "summary",
          "images": [
            "/assets/portrait.jpg",
          ],
        },
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
