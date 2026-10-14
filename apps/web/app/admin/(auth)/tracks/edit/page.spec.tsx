import { render, screen } from '@testing-library/react'

import AdminTrackEditPage from './page.next'

const mockRequireAdminSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@web/lib/auth/requireAdminSession', () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}))

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

jest.mock('../components/TrackEditorLoader', () => ({
  TrackEditorLoader: ({ path }: { path: string }) => (
    <div data-testid="track-editor-loader">{path}</div>
  ),
}))

describe('AdminTrackEditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
