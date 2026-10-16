/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import type { Mock } from 'vitest'

const mockOgImageTemplate = vi.fn()
const mockLoggerWarn = vi.fn()

vi.mock('./OgImageTemplate', () => ({
  OgImageTemplate: (props: unknown) => mockOgImageTemplate(props),
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    warn: mockLoggerWarn,
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('next-cloudinary', () => ({
  getCldImageUrl: vi.fn(function () {
    return 'https://res.cloudinary.com/test/image/upload/cover.jpg'
  }),
}))

const mockImageResponse = vi.fn()
vi.mock('next/og', () => ({
  ImageResponse: vi.fn().mockImplementation(function (...args: unknown[]) {
    mockImageResponse(...args)
    return new Response('image-data', {
      status: 200,
      headers: { 'Content-Type': 'image/png' },
    })
  }),
}))

vi.mock('axios')

describe('GET /og', () => {
  let mockAxiosGet: Mock

  beforeEach(async () => {
    vi.clearAllMocks()
    mockOgImageTemplate.mockReturnValue(null)
    const { default: axios } = await import('axios')
    mockAxiosGet = axios.get as Mock
    mockAxiosGet.mockResolvedValue({
      data: Buffer.from('fake-image-data').buffer,
      headers: { 'content-type': 'image/jpeg' },
    })
  })

  it('calls ImageResponse with 1200x630 dimensions', async () => {
    const { GET } = await import('./route')
    await GET(new NextRequest('http://localhost/og?title=Test'))
    expect(mockImageResponse).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: 1200, height: 630 }),
    )
  })

  it('uses default title when no title param provided', async () => {
    const { GET } = await import('./route')
    await GET(new NextRequest('http://localhost/og'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.title).toBe('Saúl de León')
  })

  it('passes title from query params', async () => {
    const { GET } = await import('./route')
    await GET(new NextRequest('http://localhost/og?title=My+Post+Title'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.title).toBe('My Post Title')
  })

  it('fetches cover image by public ID and passes as data URI', async () => {
    const { GET } = await import('./route')
    const { getCldImageUrl } = await import('next-cloudinary')
    await GET(
      new NextRequest('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    expect(getCldImageUrl).toHaveBeenCalledWith(
      expect.objectContaining({ src: 'blog/cover.jpg' }),
    )
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'https://res.cloudinary.com/test/image/upload/cover.jpg',
      expect.objectContaining({ responseType: 'arraybuffer' }),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('uses image/jpeg fallback when content-type header is missing', async () => {
    mockAxiosGet.mockResolvedValue({
      data: Buffer.from('fake-image-data').buffer,
      headers: {},
    })
    const { GET } = await import('./route')
    await GET(
      new NextRequest('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toMatch(/^data:image\/jpeg;base64,/)
  })

  it('passes null cover and logs warn when fetch fails', async () => {
    const err = new Error('Network error')
    mockAxiosGet.mockRejectedValue(err)
    const { GET } = await import('./route')
    await GET(
      new NextRequest('http://localhost/og?title=Test&cover=blog%2Fcover.jpg'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toBeNull()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      err,
      'Failed to fetch OG cover image',
    )
  })

  it('passes null cover when not provided', async () => {
    const { GET } = await import('./route')
    await GET(new NextRequest('http://localhost/og?title=Test'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toBeNull()
  })

  it('passes category param when provided', async () => {
    const { GET } = await import('./route')
    await GET(
      new NextRequest('http://localhost/og?title=Test&category=Engineering'),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.category).toBe('Engineering')
  })

  it('passes null category when not provided', async () => {
    const { GET } = await import('./route')
    await GET(new NextRequest('http://localhost/og?title=Test'))
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.category).toBeNull()
  })

  it('returns the ImageResponse result', async () => {
    const { GET } = await import('./route')
    const response = await GET(
      new NextRequest('http://localhost/og?title=Test'),
    )
    expect(response).toBeDefined()
  })
})

export {}
