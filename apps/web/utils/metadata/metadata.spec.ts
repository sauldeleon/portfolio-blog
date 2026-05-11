import { sharedRootMetadata, sharedRootViewport } from './metadata'

describe('sharedMetadata', () => {
  it('should match snapshot', () => {
    expect(sharedRootMetadata).toMatchInlineSnapshot(`
      {
        "alternates": {
          "languages": {
            "en-GB": "/en",
            "en-US": "/en",
            "es-ES": "/es",
            "x-default": "/en",
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
        "title": {
          "default": "Saúl de León Guerrero — Front-End Software Engineer",
          "template": "%s | Saúl de León Guerrero",
        },
        "twitter": {
          "card": "summary_large_image",
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
