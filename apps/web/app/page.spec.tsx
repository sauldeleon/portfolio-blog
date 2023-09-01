import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'

import RootPage from './page.next'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('RootPage', () => {
  it('should redirect to fallback language', async () => {
    render(<RootPage />)
    expect(redirect).toHaveBeenCalledWith(`/en`)
  })
})
