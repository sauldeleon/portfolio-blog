import { screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { MainLayout } from './MainLayout'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
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

  it('should redirect to a allowed language', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/de')
    renderApp(<MainLayout>test</MainLayout>, undefined, { language: 'de' })

    await screen.findByText('test')
    expect(mockPush).toHaveBeenCalledWith('/en/')
  })
})
