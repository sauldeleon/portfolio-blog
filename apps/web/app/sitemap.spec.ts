import sitemap from './sitemap'

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))

describe('sitemap', () => {
  it('should generate the sitemap object', () => {
    expect(sitemap()).toEqual([
      {
        lastModified: '2020-01-01T00:00:00.000Z',
        url: 'https://test.url',
      },
      {
        lastModified: '2020-01-01T00:00:00.000Z',
        url: 'https://test.url/contact',
      },
      {
        lastModified: '2020-01-01T00:00:00.000Z',
        url: 'https://test.url/experience',
      },
      {
        lastModified: '2020-01-01T00:00:00.000Z',
        url: 'https://test.url/portfolio',
      },
    ])
  })
})
