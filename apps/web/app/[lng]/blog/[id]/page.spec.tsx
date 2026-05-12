const mockNotFound = jest.fn()
const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}))

const mockGetPostById = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostById: mockGetPostById,
}))

describe('[lng]/blog/[id] - PostRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls notFound when post is null', async () => {
    mockGetPostById.mockResolvedValue(null)
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'en', id: 'missing-id' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls redirect with correct URL when post exists', async () => {
    mockGetPostById.mockResolvedValue({
      id: '01JXYZ',
      slug: 'my-test-post',
    })
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'en', id: '01JXYZ' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/en/blog/01JXYZ/my-test-post')
  })

  it('calls redirect for Spanish locale', async () => {
    mockGetPostById.mockResolvedValue({
      id: '02ABC',
      slug: 'mi-post',
    })
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'es', id: '02ABC' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/es/blog/02ABC/mi-post')
  })
})
