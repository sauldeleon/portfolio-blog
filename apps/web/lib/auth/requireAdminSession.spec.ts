import { requireAdminSession } from './requireAdminSession'

const mockAuth = vi.fn()
const mockRedirect = vi.fn()

vi.mock('./config', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
}))

describe('requireAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the active session', async () => {
    const session = { user: { name: 'admin' } }
    mockAuth.mockResolvedValue(session)

    await expect(requireAdminSession()).resolves.toBe(session)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /admin/login when no session exists', async () => {
    mockAuth.mockResolvedValue(null)

    await requireAdminSession()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/login')
  })
})
