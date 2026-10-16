import { render, screen } from '@testing-library/react'

import AdminTrackEditPage from './page.next'

const mockRequireAdminSession = vi.fn()
const mockRedirect = vi.fn()

vi.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('../components/TrackEditorLoader', () => ({
  TrackEditorLoader: ({ path }: { path: string }) => (
    <div data-testid="track-editor-loader">{path}</div>
  ),
}))

describe('AdminTrackEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdminSession.mockResolvedValue({ user: { name: 'admin' } })
  })

  it('renders the editor for the given path', async () => {
    render(
      await AdminTrackEditPage({
        searchParams: Promise.resolve({ path: 'a.gpx' }),
      }),
    )
    expect(screen.getByTestId('track-editor-loader')).toHaveTextContent('a.gpx')
  })

  it('redirects to the list without a path', async () => {
    await expect(
      AdminTrackEditPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/admin/tracks')
  })
})
