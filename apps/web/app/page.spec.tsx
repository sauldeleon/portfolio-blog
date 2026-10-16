import { renderWithTheme } from '@sdlgr/test-utils'

import RootPage from './page.next'

const mockPush = vi.fn()
vi.mock('next/navigation', async () => ({
  ...(await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  )),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('RootPage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => vi.fn())
  })

  it('should redirect to fallback language', async () => {
    const { baseElement } = renderWithTheme(<RootPage />)
    expect(mockPush).toHaveBeenCalledWith(`/en`)
    expect(baseElement).toMatchSnapshot()
  })
})
