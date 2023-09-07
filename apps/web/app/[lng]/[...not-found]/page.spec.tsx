import { notFound } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { NotFound } from './page.next'

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  notFound: jest.fn(),
}))

describe('NotFound', () => {
  it('should render successfully', () => {
    ;(notFound as unknown as jest.Mock).mockImplementation(() => jest.fn())
    renderApp(<NotFound />)
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
