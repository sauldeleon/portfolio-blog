/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockAuth = jest.fn()
const mockListImages = jest.fn()
const mockRenameImage = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/cloudinary/images', () => ({
  listImages: mockListImages,
  renameImage: mockRenameImage,
}))

const { GET, PATCH } = require('./route') as {
  GET: (request: NextRequest) => Promise<Response>
  PATCH: (request: NextRequest) => Promise<Response>
}

function makeRequest(cursor?: string) {
  const url = cursor
    ? `http://localhost/api/images/?cursor=${cursor}`
    : 'http://localhost/api/images/'
  return new NextRequest(url)
}

const mockImages = [
  {
    publicId: 'sawl.dev - blog/photo',
    url: 'https://res.cloudinary.com/demo/image/upload/photo.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
    createdAt: '2024-01-01T00:00:00Z',
    bytes: 12345,
  },
]

describe('GET /api/images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await GET(makeRequest())
    expect(response.status).toBe(401)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Unauthorized')
  })

  it('returns images list on success without nextCursor', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockListImages.mockResolvedValue({ images: mockImages })
    const response = await GET(makeRequest())
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      images: typeof mockImages
      nextCursor?: string
    }
    expect(body.images).toEqual(mockImages)
    expect(body.nextCursor).toBeUndefined()
  })

  it('returns images list with nextCursor when more pages exist', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockListImages.mockResolvedValue({
      images: mockImages,
      nextCursor: 'cursor-abc-123',
    })
    const response = await GET(makeRequest())
    expect(response.status).toBe(200)
    const body = (await response.json()) as {
      images: typeof mockImages
      nextCursor?: string
    }
    expect(body.images).toEqual(mockImages)
    expect(body.nextCursor).toBe('cursor-abc-123')
  })

  it('passes cursor query param to listImages', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockListImages.mockResolvedValue({ images: mockImages })
    await GET(makeRequest('cursor-xyz-789'))
    expect(mockListImages).toHaveBeenCalledWith('cursor-xyz-789')
  })

  it('passes undefined cursor when no query param', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockListImages.mockResolvedValue({ images: mockImages })
    await GET(makeRequest())
    expect(mockListImages).toHaveBeenCalledWith(undefined)
  })

  it('returns 500 when listImages throws', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockListImages.mockRejectedValue(new Error('Cloudinary error'))
    const response = await GET(makeRequest())
    expect(response.status).toBe(500)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Failed to list images')
  })
})

const mockRenamedImage = {
  publicId: 'sawl.dev - blog/new-name',
  url: 'https://res.cloudinary.com/demo/image/upload/new-name.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
  createdAt: '2024-01-01T00:00:00Z',
  bytes: 12345,
}

function makePatchRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/images/', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('PATCH /api/images', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await PATCH(
      makePatchRequest({ publicId: 'sawl.dev - blog/photo', newName: 'new' }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 400 when publicId is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PATCH(makePatchRequest({ newName: 'new' }))
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Missing publicId or newName')
  })

  it('returns 400 when newName is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await PATCH(
      makePatchRequest({ publicId: 'sawl.dev - blog/photo' }),
    )
    expect(response.status).toBe(400)
  })

  it('returns renamed image on success', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockRenameImage.mockResolvedValue(mockRenamedImage)
    const response = await PATCH(
      makePatchRequest({
        publicId: 'sawl.dev - blog/photo',
        newName: 'new-name',
      }),
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual(mockRenamedImage)
    expect(mockRenameImage).toHaveBeenCalledWith(
      'sawl.dev - blog/photo',
      'new-name',
    )
  })

  it('returns 500 when renameImage throws', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockRenameImage.mockRejectedValue(new Error('Cloudinary error'))
    const response = await PATCH(
      makePatchRequest({
        publicId: 'sawl.dev - blog/photo',
        newName: 'new-name',
      }),
    )
    expect(response.status).toBe(500)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Failed to rename image')
  })
})

export {}
