import { screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { LanguageGuard } from './LanguageGuard'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LanguageGuard', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<LanguageGuard>test</LanguageGuard>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })

  it('should redirect to a allowed language', async () => {
    ;(usePathname as jest.Mock).mockReturnValue('/de')
    renderApp(<LanguageGuard>test</LanguageGuard>, undefined, {
      language: 'de',
    })

    expect(mockPush).toHaveBeenCalledWith('/en/')
  })
})
