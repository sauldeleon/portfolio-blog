import { notFound } from 'next/navigation'
import type { Mock } from 'vitest'

import { renderApp } from '@sdlgr/test-utils'

import { NotFound } from './page.next'

vi.mock('next/navigation', async () => ({
  ...(await vi.importActual<typeof import('next/navigation')>(
    'next/navigation',
  )),
  notFound: vi.fn(),
}))

describe('NotFound', () => {
  it('should render successfully', () => {
    ;(notFound as unknown as Mock).mockImplementation(() => vi.fn())
    renderApp(<NotFound />)
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
