import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { MainLayout } from './MainLayout'

const mockPush = vi.fn()
vi.mock('next/navigation', async () => ({
  ...(await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  )),
  usePathname: vi.fn().mockImplementation(() => '/en'),
  useSelectedLayoutSegments: () => ['(home)'],
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('MainLayout', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<MainLayout>test</MainLayout>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })
})
