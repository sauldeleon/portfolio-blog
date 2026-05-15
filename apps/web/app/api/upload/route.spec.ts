/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockUploadImage = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/cloudinary/upload', () => ({
  uploadImage: mockUploadImage,
}))

const { POST } = require('./route') as {
  POST: (req: Request) => Promise<Response>
}

const mockUploadResult = {
  url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  publicId: 'sawl.dev - blog/sample',
  width: 800,
  height: 600,
  altText: 'test alt',
}

function makeFormDataRequest(opts: {
  file?: { content: string; name: string; type: string } | null
  altText?: string
  name?: string
}): Request {
  const req = new Request('http://localhost/api/upload', { method: 'POST' })
  const fd = new FormData()
  if (opts.file !== null && opts.file !== undefined) {
    const file = new File([opts.file.content], opts.file.name, {
      type: opts.file.type,
    })
    fd.append('file', file)
  }
  if (opts.altText !== undefined) {
    fd.append('altText', opts.altText)
  }
  if (opts.name !== undefined) {
    fd.append('name', opts.name)
  }
  jest.spyOn(Request.prototype, 'formData').mockResolvedValueOnce(fd)
  return req
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await POST(
      new Request('http://localhost/api/upload', { method: 'POST' }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 400 when form data is invalid', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    jest
      .spyOn(Request.prototype, 'formData')
      .mockRejectedValueOnce(new Error('bad'))
    const response = await POST(
      new Request('http://localhost/api/upload', { method: 'POST' }),
    )
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Invalid form data')
  })

  it('returns 400 when file field is missing', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(makeFormDataRequest({ file: null }))
    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('File is required')
  })

  it('returns 415 for unsupported MIME type', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const response = await POST(
      makeFormDataRequest({
        file: { content: 'data', name: 'doc.pdf', type: 'application/pdf' },
      }),
    )
    expect(response.status).toBe(415)
  })

  it('returns 413 when file exceeds 10 MB', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const bigContent = 'x'.repeat(10 * 1024 * 1024 + 1)
    const response = await POST(
      makeFormDataRequest({
        file: { content: bigContent, name: 'big.jpg', type: 'image/jpeg' },
      }),
    )
    expect(response.status).toBe(413)
  })

  it('uploads and returns 201 with result', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockResolvedValue(mockUploadResult)
    const response = await POST(
      makeFormDataRequest({
        file: { content: 'imgdata', name: 'photo.jpg', type: 'image/jpeg' },
        altText: 'test alt',
      }),
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual(mockUploadResult)
    expect(mockUploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/jpeg',
      'test alt',
      undefined,
    )
  })

  it('passes name to uploadImage when name is in FormData', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockResolvedValue(mockUploadResult)
    await POST(
      makeFormDataRequest({
        file: { content: 'imgdata', name: 'photo.jpg', type: 'image/jpeg' },
        name: 'my-custom-name',
      }),
    )
    expect(mockUploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/jpeg',
      '',
      'my-custom-name',
    )
  })

  it('passes undefined as name when name is empty string in FormData', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockResolvedValue(mockUploadResult)
    await POST(
      makeFormDataRequest({
        file: { content: 'imgdata', name: 'photo.jpg', type: 'image/jpeg' },
        name: '',
      }),
    )
    expect(mockUploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/jpeg',
      '',
      undefined,
    )
  })

  it('defaults altText to empty string when not provided', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockResolvedValue(mockUploadResult)
    await POST(
      makeFormDataRequest({
        file: { content: 'data', name: 'photo.png', type: 'image/png' },
      }),
    )
    expect(mockUploadImage).toHaveBeenCalledWith(
      expect.any(Buffer),
      'image/png',
      '',
      undefined,
    )
  })

  it('returns 500 when uploadImage throws', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockRejectedValue(new Error('Cloudinary error'))
    const response = await POST(
      makeFormDataRequest({
        file: { content: 'data', name: 'photo.jpg', type: 'image/jpeg' },
      }),
    )
    expect(response.status).toBe(500)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Upload failed')
  })

  it('accepts image/webp and image/gif', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockUploadImage.mockResolvedValue(mockUploadResult)

    const webpResponse = await POST(
      makeFormDataRequest({
        file: { content: 'data', name: 'anim.webp', type: 'image/webp' },
      }),
    )
    expect(webpResponse.status).toBe(201)

    const gifResponse = await POST(
      makeFormDataRequest({
        file: { content: 'data', name: 'anim.gif', type: 'image/gif' },
      }),
    )
    expect(gifResponse.status).toBe(201)
  })
})

export {}
