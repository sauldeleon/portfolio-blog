/**
 * @jest-environment node
 */
const mockOgImageTemplate = jest.fn()

jest.mock('./OgImageTemplate', () => ({
  OgImageTemplate: (props: unknown) => mockOgImageTemplate(props),
}))

jest.mock('next-cloudinary', () => ({
  getCldImageUrl: jest.fn(
    () => 'https://res.cloudinary.com/test/image/upload/cover.jpg',
  ),
}))

const mockImageResponse = jest.fn()
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((...args: unknown[]) => {
    mockImageResponse(...args)
    return new Response('image-data', {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    })
  }),
}))

describe('GET /og', () => {
  let mockFetch: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockOgImageTemplate.mockReturnValue(null)
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      arrayBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from('fake-image-data').buffer),
      headers: { get: jest.fn().mockReturnValue('image/jpeg') },
    } as unknown as Response)
  })

  afterEach(() => {
    mockFetch.mockRestore()
  })

  it('calls ImageResponse with 1200x630 dimensions', async () => {
    const { GET } = require('./route')
    await GET(new Request('http://localhost/og?title=Test'))
    expect(mockImageResponse).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1200, height: 630 }),
    )
  })

  it('uses default title when no title param provided', async () => {
    const { GET } = require('./route')
    await GET(new Request('http://localhost/og'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.title).toBe('Saúl de León')
  })

  it('passes title from query params', async () => {
    const { GET } = require('./route')
    await GET(new Request('http://localhost/og?title=My+Post+Title'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.title).toBe('My Post Title')
  })

  it('fetches cover image by public ID and passes as data URI', async () => {
    const { GET } = require('./route')
    const { getCldImageUrl } = require('next-cloudinary')
    await GET(
      new Request('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    expect(getCldImageUrl).toHaveBeenCalledWith(
      expect.objectContaining({ src: 'blog/cover.jpg' }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      'https://res.cloudinary.com/test/image/upload/cover.jpg',
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('uses image/jpeg fallback when content-type header is missing', async () => {
    mockFetch.mockResolvedValue({
      arrayBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from('fake-image-data').buffer),
      headers: { get: jest.fn().mockReturnValue(null) },
    } as unknown as Response)
    const { GET } = require('./route')
    await GET(
      new Request('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('passes null cover when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { GET } = require('./route')
    await GET(
      new Request('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toBeNull()
  })

  it('passes null cover when not provided', async () => {
    const { GET } = require('./route')
    await GET(new Request('http://localhost/og?title=Test'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toBeNull()
  })

  it('passes category param when provided', async () => {
    const { GET } = require('./route')
    await GET(
      new Request('http://localhost/og?title=Test&category=Engineering'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.category).toBe('Engineering')
  })

  it('passes null category when not provided', async () => {
    const { GET } = require('./route')
    await GET(new Request('http://localhost/og?title=Test'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.category).toBeNull()
  })

  it('returns the ImageResponse result', async () => {
    const { GET } = require('./route')
    const response = await GET(new Request('http://localhost/og?title=Test'))
    expect(response).toBeDefined()
  })
})
