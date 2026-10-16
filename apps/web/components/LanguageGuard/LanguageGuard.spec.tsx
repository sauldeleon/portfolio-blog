import { screen } from '@testing-library/react'
import { useParams, usePathname } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import { LanguageGuard } from './LanguageGuard'

const mockPush = vi.fn()
vi.mock('next/navigation', async () => ({
  ...(await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  )),
  usePathname: vi.fn(),
  useParams: vi.fn(),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LanguageGuard', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })
  it('should render successfully', async () => {
    ;(usePathname as Mock).mockImplementation(() => '/en')
    ;(useParams as Mock).mockImplementation(() => ({ lng: 'en' }))
    const { baseElement } = renderApp(<LanguageGuard>test</LanguageGuard>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })

  it('should redirect to a allowed language when a language path is the first one', async () => {
    ;(usePathname as Mock).mockImplementation(() => '/de/path')
    ;(useParams as Mock).mockImplementation(() => ({ lng: 'de' }))
    renderApp(<LanguageGuard>test</LanguageGuard>)

    expect(mockPush).toHaveBeenCalledWith('/en/path')
  })

  it('should redirect to a allowed language page when a non language path is the first one', async () => {
    ;(usePathname as Mock).mockImplementation(() => '/potato/jam')
    ;(useParams as Mock).mockImplementation(() => ({ lng: 'potato' }))
    renderApp(<LanguageGuard>test</LanguageGuard>)

    expect(mockPush).toHaveBeenCalledWith('/en/potato/jam')
  })
})
