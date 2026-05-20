/**
 * @jest-environment node
 */
const mockAuth = jest.fn()
const mockDestroyImage = jest.fn()
const mockLoggerError = jest.fn()

jest.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
jest.mock('@web/lib/cloudinary/images', () => ({
  destroyImage: mockDestroyImage,
}))
jest.mock('@web/lib/logger', () => ({ logger: { error: mockLoggerError } }))

const { DELETE } = require('./route') as {
  DELETE: (
    req: Request,
    ctx: { params: Promise<{ publicId: string[] }> },
  ) => Promise<Response>
}

function makeCtx(segments: string[]) {
  return { params: Promise.resolve({ publicId: segments }) }
}

describe('DELETE /api/images/[...publicId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const response = await DELETE(
      new Request('http://localhost/api/images/sawl.dev%20-%20blog/photo', {
        method: 'DELETE',
      }),
      makeCtx(['sawl.dev - blog', 'photo']),
    )
    expect(response.status).toBe(401)
  })

  it('returns 204 on successful delete', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    mockDestroyImage.mockResolvedValue(undefined)
    const response = await DELETE(
      new Request('http://localhost/api/images/sawl.dev%20-%20blog/photo', {
        method: 'DELETE',
      }),
      makeCtx(['sawl.dev - blog', 'photo']),
    )
    expect(response.status).toBe(204)
    expect(mockDestroyImage).toHaveBeenCalledWith('sawl.dev - blog/photo')
  })

  it('returns 500 and logs error when destroyImage throws', async () => {
    mockAuth.mockResolvedValue({ user: { name: 'admin' } })
    const err = new Error('Destroy failed')
    mockDestroyImage.mockRejectedValue(err)
    const response = await DELETE(
      new Request('http://localhost/api/images/sawl.dev%20-%20blog/photo', {
        method: 'DELETE',
      }),
      makeCtx(['sawl.dev - blog', 'photo']),
    )
    expect(response.status).toBe(500)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('Failed to delete image')
    expect(mockLoggerError).toHaveBeenCalledWith(err, 'Failed to delete image')
  })
})

export {}
