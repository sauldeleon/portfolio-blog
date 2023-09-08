import robots from './robots'

describe('robots', () => {
  it('should generate the robots object', () => {
    expect(robots()).toMatchInlineSnapshot(`
      {
        "host": "https://test.url",
        "rules": {
          "allow": "/",
          "disallow": [
            "/*/contact/",
          ],
          "userAgent": "*",
        },
        "sitemap": "https://test.url/sitemap.xml",
      }
    `)
  })
})
