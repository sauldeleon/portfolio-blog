const mockNotFound = jest.fn()
const mockRedirect = jest.fn()

jest.mock('next/navigation', () => ({
  notFound: mockNotFound,
  redirect: mockRedirect,
}))

const mockGetPostByNumber = jest.fn()

jest.mock('@web/lib/db/queries/posts', () => ({
  getPostByNumber: mockGetPostByNumber,
}))

describe('[lng]/blog/[id] - PostRedirectPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls notFound when id is not a number', async () => {
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'en', id: 'not-a-number' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
    expect(mockGetPostByNumber).not.toHaveBeenCalled()
  })

  it('calls notFound when post is null', async () => {
    mockGetPostByNumber.mockResolvedValue(null)
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'en', id: '42' }),
    })
    expect(mockNotFound).toHaveBeenCalledTimes(1)
  })

  it('calls redirect with correct URL when post exists', async () => {
    mockGetPostByNumber.mockResolvedValue({
      postNumber: 42,
      slug: 'my-test-post',
    })
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'en', id: '42' }),
    })
    expect(mockGetPostByNumber).toHaveBeenCalledWith(42, 'en')
    expect(mockRedirect).toHaveBeenCalledWith('/en/blog/42/my-test-post')
  })

  it('calls redirect for Spanish locale', async () => {
    mockGetPostByNumber.mockResolvedValue({
      postNumber: 7,
      slug: 'mi-post',
    })
    const { default: PostRedirectPage } = require('./page.next')
    await PostRedirectPage({
      params: Promise.resolve({ lng: 'es', id: '7' }),
    })
    expect(mockRedirect).toHaveBeenCalledWith('/es/blog/7/mi-post')
  })
})
