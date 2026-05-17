import { render, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

import { AdminQueryProvider } from './AdminQueryProvider'

const mockPush = jest.fn()

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null,
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('AdminQueryProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders children', () => {
    render(
      <AdminQueryProvider>
        <div data-testid="child">hello</div>
      </AdminQueryProvider>,
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('redirects to /admin/login on 401 axios response', async () => {
    render(
      <AdminQueryProvider>
        <div />
      </AdminQueryProvider>,
    )
    const error = new AxiosError('Unauthorized', '401', undefined, undefined, {
      status: 401,
      data: { error: 'Unauthorized' },
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    })
    await axios.interceptors.response.handlers.at(-1)!.rejected!(error).catch(
      () => undefined,
    )
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/login'))
  })

  it('does not redirect on non-401 axios errors', async () => {
    render(
      <AdminQueryProvider>
        <div />
      </AdminQueryProvider>,
    )
    const error = new AxiosError('Server Error', '500', undefined, undefined, {
      status: 500,
      data: { error: 'Internal Server Error' },
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as never,
    })
    await axios.interceptors.response.handlers.at(-1)!.rejected!(error).catch(
      () => undefined,
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not redirect on non-axios errors', async () => {
    render(
      <AdminQueryProvider>
        <div />
      </AdminQueryProvider>,
    )
    await axios.interceptors.response.handlers.at(-1)!.rejected!(
      new Error('Network error'),
    ).catch(() => undefined)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('passes through successful responses unchanged', async () => {
    render(
      <AdminQueryProvider>
        <div />
      </AdminQueryProvider>,
    )
    const response = { data: { ok: true }, status: 200 }
    const result = await axios.interceptors.response.handlers.at(-1)!
      .fulfilled!(response as never)
    expect(result).toBe(response)
  })

  it('ejects interceptor on unmount', () => {
    const ejectSpy = jest.spyOn(axios.interceptors.response, 'eject')
    const { unmount } = render(
      <AdminQueryProvider>
        <div />
      </AdminQueryProvider>,
    )
    unmount()
    expect(ejectSpy).toHaveBeenCalledTimes(1)
  })
})
