import { screen } from '@testing-library/react'
import { useParams, usePathname } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { LanguageGuard } from './LanguageGuard'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: jest.fn(),
  useParams: jest.fn(),
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LanguageGuard', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  it('should render successfully', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/en')
    ;(useParams as jest.Mock).mockImplementation(() => ({ lng: 'en' }))
    const { baseElement } = renderApp(<LanguageGuard>test</LanguageGuard>)
    await screen.findByText('test')
    expect(baseElement).toMatchSnapshot()
  })

  it('should redirect to a allowed language when a language path is the first one', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/de/path')
    ;(useParams as jest.Mock).mockImplementation(() => ({ lng: 'de' }))
    renderApp(<LanguageGuard>test</LanguageGuard>)

    expect(mockPush).toHaveBeenCalledWith('/en/path')
  })

  it('should redirect to a allowed language page when a non language path is the first one', async () => {
    ;(usePathname as jest.Mock).mockImplementation(() => '/potato/jam')
    ;(useParams as jest.Mock).mockImplementation(() => ({ lng: 'potato' }))
    renderApp(<LanguageGuard>test</LanguageGuard>)

    expect(mockPush).toHaveBeenCalledWith('/en/potato/jam')
  })
})
