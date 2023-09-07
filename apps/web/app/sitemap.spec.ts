import sitemap from './sitemap'

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))

describe('sitemap', () => {
  it('should generate the sitemap object', () => {
    expect(sitemap()).toMatchInlineSnapshot(`
      [
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/en/",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/en/contact",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/en/experience",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/en/portfolio",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/en/blog",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/es/",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/es/contact",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/es/experience",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/es/portfolio",
        },
        {
          "lastModified": "2020-01-01T00:00:00.000Z",
          "url": "https://test.url/es/blog",
        },
      ]
    `)
  })
})
