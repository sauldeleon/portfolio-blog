import sitemap from './sitemap'

describe('sitemap', () => {
  it('should generate the sitemap object', () => {
    expect(sitemap()).toMatchInlineSnapshot(`
      [
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/contact/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/experience/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/en/portfolio/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/contact/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/experience/",
        },
        {
          "lastModified": "2026-05-11T00:00:00.000Z",
          "url": "https://test.url/es/portfolio/",
        },
      ]
    `)
  })
})
