import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { SubscribeForm } from './SubscribeForm'

const mockT = jest.fn((key: string, opts?: { email?: string }) =>
  opts?.email ? `Success email: ${opts.email}` : key,
)
const mockUseClientTranslation = jest.fn()
const mockTurnstileOnSuccess = jest.fn()
const mockTurnstileOnError = jest.fn()
const mockTurnstileOnExpire = jest.fn()

jest.mock('axios', () => ({ post: jest.fn() }))

const mockAxiosPost = jest.mocked(axios.post)

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => mockUseClientTranslation(),
}))

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({
    onSuccess,
    onError,
    onExpire,
  }: {
    onSuccess: (token: string) => void
    onError: () => void
    onExpire: () => void
    siteKey: string
  }) => {
    mockTurnstileOnSuccess.mockImplementation(onSuccess)
    mockTurnstileOnError.mockImplementation(onError)
    mockTurnstileOnExpire.mockImplementation(onExpire)
    return <div data-testid="turnstile" />
  },
}))

const originalEnv = process.env

beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site-key',
  }
  mockUseClientTranslation.mockReturnValue({ t: mockT })
  mockAxiosPost.mockResolvedValue({ data: {} })
})

afterAll(() => {
  process.env = originalEnv
})

describe('SubscribeForm', () => {
  it('renders form fields and titles', () => {
    const { baseElement } = renderApp(<SubscribeForm lng="en" />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByLabelText('nameLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('emailLabel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('hides titles when showTitles=false', () => {
    renderApp(<SubscribeForm lng="en" showTitles={false} />)
    expect(screen.queryByText('title')).not.toBeInTheDocument()
    expect(screen.queryByText('subtitle')).not.toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    renderApp(<SubscribeForm lng="en" />)

    act(() => mockTurnstileOnSuccess('turnstile-token'))

    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('successTitle')).toBeInTheDocument()
    })
  })

  it('shows alreadySubscribed message when already subscribed', async () => {
    mockAxiosPost.mockResolvedValueOnce({ data: { alreadySubscribed: true } })
    renderApp(<SubscribeForm lng="en" />)

    act(() => mockTurnstileOnSuccess('turnstile-token'))

    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))

    await waitFor(() => {
      expect(screen.getByText('alreadySubscribed')).toBeInTheDocument()
    })
  })

  it('shows error message on request failure', async () => {
    mockAxiosPost.mockRejectedValueOnce(new Error('Failed'))
    renderApp(<SubscribeForm lng="en" />)

    act(() => mockTurnstileOnSuccess('turnstile-token'))

    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('error')
    })
  })

  it('shows error on network failure', async () => {
    mockAxiosPost.mockRejectedValueOnce(new Error('Network error'))
    renderApp(<SubscribeForm lng="en" />)

    act(() => mockTurnstileOnSuccess('turnstile-token'))

    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('error')
    })
  })

  it('disables submit button when turnstile has not succeeded yet', () => {
    renderApp(<SubscribeForm lng="en" />)
    expect(screen.getByRole('button', { name: 'submitLabel' })).toBeDisabled()
  })

  it('enables submit button after turnstile succeeds', () => {
    renderApp(<SubscribeForm lng="en" />)
    act(() => mockTurnstileOnSuccess('turnstile-token'))
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).not.toBeDisabled()
  })

  it('shows validation errors for empty fields', async () => {
    renderApp(<SubscribeForm lng="en" />)
    act(() => mockTurnstileOnSuccess('turnstile-token'))

    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('does not show titles area but still renders when no site key', () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_TURNSTILE_SITE_KEY: '' }
    renderApp(<SubscribeForm lng="en" />)
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).not.toBeDisabled()
  })

  it('enables submit when turnstile fires onError (allows submission with error token)', () => {
    renderApp(<SubscribeForm lng="en" />)
    expect(screen.getByRole('button', { name: 'submitLabel' })).toBeDisabled()
    act(() => mockTurnstileOnError())
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).not.toBeDisabled()
  })

  it('disables submit when turnstile fires onExpire', () => {
    renderApp(<SubscribeForm lng="en" />)
    act(() => mockTurnstileOnSuccess('token'))
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).not.toBeDisabled()
    act(() => mockTurnstileOnExpire())
    expect(screen.getByRole('button', { name: 'submitLabel' })).toBeDisabled()
  })

  it('submits with __cf_error__ token when turnstile fires onError', async () => {
    renderApp(<SubscribeForm lng="en" />)
    act(() => mockTurnstileOnError())
    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))
    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledWith(
        '/api/subscribe/',
        expect.objectContaining({ turnstileToken: '__cf_error__' }),
      )
    })
  })

  it('button not disabled and turnstile hidden when NEXT_PUBLIC_TURNSTILE_SITE_KEY is undefined', () => {
    const env = { ...originalEnv }
    delete env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    process.env = env
    renderApp(<SubscribeForm lng="en" />)
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'submitLabel' }),
    ).not.toBeDisabled()
  })

  it('shows submitting text on button while form is pending', async () => {
    let resolveFetch!: (value: unknown) => void
    mockAxiosPost.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    renderApp(<SubscribeForm lng="en" />)
    act(() => mockTurnstileOnSuccess('token'))
    await userEvent.type(screen.getByLabelText('nameLabel'), 'Test User')
    await userEvent.type(
      screen.getByLabelText('emailLabel'),
      'test@example.com',
    )
    await userEvent.click(screen.getByRole('button', { name: 'submitLabel' }))
    expect(
      await screen.findByRole('button', { name: 'submitting' }),
    ).toBeInTheDocument()
    resolveFetch({ data: {} })
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })
})
