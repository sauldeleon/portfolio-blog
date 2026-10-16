import { isServeableBlogPath } from './isServeableBlogPath'

describe('isServeableBlogPath', () => {
  it.each([
    '/en/blog/',
    '/es/blog',
    '/en/blog/547/',
    '/en/blog/547/from-valle-de-pineta-to-tucarroya/',
    '/es/blog/12/de-goriz-a-la-pradera-de-ordesa',
    '/es/blog/3/ca%C3%B1on-del-r%C3%ADo',
  ])('serves %s', (path) => {
    expect(isServeableBlogPath(path)).toBe(true)
  })

  it.each([
    ['an unknown language', '/de/blog/547/slug/'],
    ['a non-numeric post number', '/en/blog/abc/slug/'],
    ['an over-long post number', '/en/blog/1234567890/slug/'],
    ['extra segments', '/en/blog/547/slug/extra/'],
    ['a slug with invalid characters', '/en/blog/547/bad_slug!/'],
    ['a slug with doubled hyphens', '/en/blog/547/a--b/'],
    ['an over-long slug', `/en/blog/547/${'a'.repeat(201)}/`],
    ['a malformed percent-encoding', '/en/blog/547/%E0%A4%A/'],
  ])('rejects %s', (_label, path) => {
    expect(isServeableBlogPath(path)).toBe(false)
  })

  it('does not judge paths outside the blog', () => {
    expect(isServeableBlogPath('/en/contact/')).toBe(true)
    expect(isServeableBlogPath('/blog/preview/token/')).toBe(true)
    expect(isServeableBlogPath('/')).toBe(true)
  })
})
