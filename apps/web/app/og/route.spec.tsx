/**
 * @jest-environment node
 */
const mockOgImageTemplate = jest.fn()

jest.mock('./OgImageTemplate', () => ({
  OgImageTemplate: (props: unknown) => mockOgImageTemplate(props),
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
  beforeEach(() => {
    jest.clearAllMocks()
    mockOgImageTemplate.mockReturnValue(null)
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

  it('passes cover param when provided', async () => {
    const { GET } = require('./route')
    await GET(
      new Request(
        'http://localhost/og?title=Test&cover=https%3A%2F%2Fimg.example.com%2Fphoto.jpg',
      ),
    )
    const element = mockImageResponse.mock.calls[0][0]
    expect(element.props.cover).toBe('https://img.example.com/photo.jpg')
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
