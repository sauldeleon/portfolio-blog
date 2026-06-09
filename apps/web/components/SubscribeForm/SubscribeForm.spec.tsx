import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { SubscribeForm } from './SubscribeForm'

const mockT = jest.fn((key: string, opts?: { email?: string }) =>
  opts?.email ? `Success email: ${opts.email}` : key,
)
const mockUseClientTranslation = jest.fn()
const mockFetch = jest.fn()
const mockTurnstileOnSuccess = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => mockUseClientTranslation(),
}))

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({
    onSuccess,
  }: {
    onSuccess: (token: string) => void
    siteKey: string
  }) => {
    mockTurnstileOnSuccess.mockImplementation(onSuccess)
    return <div data-testid="turnstile" />
  },
}))

global.fetch = mockFetch

const originalEnv = process.env

beforeEach(() => {
  jest.clearAllMocks()
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test-site-key',
  }
  mockUseClientTranslation.mockReturnValue({ t: mockT })
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true }),
  })
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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, alreadySubscribed: true }),
    })
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

  it('shows error message on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed' }),
    })
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
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
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
})
