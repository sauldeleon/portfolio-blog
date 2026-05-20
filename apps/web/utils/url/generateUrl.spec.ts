import { getSiteUrl, publicUrl } from './generateUrl'

const originalBaseUrl = process.env.BASE_URL
const originalVercelUrl = process.env.VERCEL_URL

afterEach(() => {
  process.env.BASE_URL = originalBaseUrl
  if (originalVercelUrl === undefined) {
    delete process.env.VERCEL_URL
  } else {
    process.env.VERCEL_URL = originalVercelUrl
  }
})

describe('getSiteUrl', () => {
  it('returns BASE_URL when set', () => {
    process.env.BASE_URL = 'https://www.sawl.dev'
    expect(getSiteUrl()).toBe('https://www.sawl.dev')
  })

  it('returns https VERCEL_URL when BASE_URL is not set', () => {
    delete process.env.BASE_URL
    process.env.VERCEL_URL = 'my-deploy.vercel.app'
    expect(getSiteUrl()).toBe('https://my-deploy.vercel.app')
  })

  it('prefers BASE_URL over VERCEL_URL', () => {
    process.env.BASE_URL = 'https://www.sawl.dev'
    process.env.VERCEL_URL = 'my-deploy.vercel.app'
    expect(getSiteUrl()).toBe('https://www.sawl.dev')
  })

  it('returns empty string when neither is set', () => {
    delete process.env.BASE_URL
    delete process.env.VERCEL_URL
    expect(getSiteUrl()).toBe('')
  })
})

describe('publicUrl', () => {
  it('should generate the public url', () => {
    expect(publicUrl('/')).toEqual('https://test.url/')
    expect(publicUrl('/contact')).toEqual('https://test.url/contact')
  })
})
