import { renderWithTheme } from '@sdlgr/test-utils'

import RootPage from './page.next'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('RootPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => jest.fn())
  })

  it('should redirect to fallback language', async () => {
    const { baseElement } = renderWithTheme(<RootPage />)
    expect(mockPush).toHaveBeenCalledWith(`/en`)
    expect(baseElement).toMatchSnapshot()
  })
})
