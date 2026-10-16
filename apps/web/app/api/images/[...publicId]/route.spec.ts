/**
 * @vitest-environment node
 */
const mockAuth = vi.fn()
const mockDestroyImage = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@web/lib/auth/config', () => ({ auth: mockAuth }))
vi.mock('@web/lib/cloudinary/images', () => ({
  destroyImage: mockDestroyImage,
}))
vi.mock('@web/lib/logger', () => ({
  logger: {
    error: mockLoggerError,
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}))

const { DELETE } = (await import('./route')) as {
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
    vi.clearAllMocks()
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
