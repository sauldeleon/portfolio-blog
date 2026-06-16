import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { CommentForm } from './CommentForm'

const mockT = jest.fn((key: string, opts?: { username?: string }) =>
  opts?.username ? `Reply to ${opts.username}` : key,
)
const mockUseClientTranslation = jest.fn()
const mockFetch = jest.fn()
const mockTurnstileOnSuccess = jest.fn()
const mockTurnstileOnError = jest.fn()
const mockTurnstileOnExpire = jest.fn()

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
  }) => {
    mockTurnstileOnSuccess.mockImplementation(onSuccess)
    mockTurnstileOnError.mockImplementation(onError)
    mockTurnstileOnExpire.mockImplementation(onExpire)
    return <div data-testid="turnstile" />
  },
}))

const defaultProps = {
  postId: 'post-ulid-123',
  postTitle: 'My Post',
  postNumber: 1,
  postSlug: 'my-post',
  postLng: 'en',
  lng: 'en',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseClientTranslation.mockReturnValue({ t: mockT })
  global.fetch = mockFetch
  mockFetch.mockResolvedValue({ ok: true })
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
})

describe('CommentForm', () => {
  it('renders username and body fields', () => {
    renderApp(<CommentForm {...defaultProps} />)
    expect(screen.getByLabelText('comments.form.username')).toBeInTheDocument()
    expect(screen.getByLabelText('comments.form.body')).toBeInTheDocument()
  })

  it('renders the Turnstile widget when siteKey present', () => {
    renderApp(<CommentForm {...defaultProps} />)
    expect(screen.getByTestId('turnstile')).toBeInTheDocument()
  })

  it('does not render Turnstile when siteKey absent', () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    renderApp(<CommentForm {...defaultProps} />)
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument()
  })

  it('submit button is disabled until captcha resolves', () => {
    renderApp(<CommentForm {...defaultProps} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('submit button is enabled after captcha success', async () => {
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('test-token'))
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('submit button enabled when captcha errors', async () => {
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnError())
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('disables submit button again on captcha expire', async () => {
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('test-token'))
    act(() => mockTurnstileOnExpire())
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('submits form with correct payload', async () => {
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('my-token'))

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Great post!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/posts/post-ulid-123/comments',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"username":"tester"'),
        }),
      )
    })
  })

  it('shows success message after successful submit', async () => {
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('my-token'))

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Great post!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'comments.form.success',
      )
    })
  })

  it('shows error message on failed submit', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('my-token'))

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Great post!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('comments.form.error')
    })
  })

  it('shows error message when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnSuccess('my-token'))

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Great post!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('comments.form.error')
    })
  })

  it('renders reply banner when replyToUsername provided', () => {
    renderApp(
      <CommentForm {...defaultProps} replyToId="c1" replyToUsername="Alice" />,
    )
    expect(screen.getByTestId('reply-banner')).toBeInTheDocument()
    expect(screen.getByText('Reply to Alice')).toBeInTheDocument()
  })

  it('does not render reply banner without replyToUsername', () => {
    renderApp(<CommentForm {...defaultProps} />)
    expect(screen.queryByTestId('reply-banner')).not.toBeInTheDocument()
  })

  it('calls onCancelReply when cancel reply clicked', async () => {
    const mockCancel = jest.fn()
    const user = userEvent.setup()
    renderApp(
      <CommentForm
        {...defaultProps}
        replyToId="c1"
        replyToUsername="Alice"
        onCancelReply={mockCancel}
      />,
    )
    await user.click(screen.getByTestId('cancel-reply'))
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnError())
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sends __cf_error__ token when captcha errored but form valid', async () => {
    const user = userEvent.setup()
    renderApp(<CommentForm {...defaultProps} />)
    act(() => mockTurnstileOnError())

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Great post!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"turnstileToken":"__cf_error__"'),
        }),
      )
    })
  })

  it('includes parentId in payload when replyToId provided', async () => {
    const user = userEvent.setup()
    renderApp(
      <CommentForm
        {...defaultProps}
        replyToId="parent-id"
        replyToUsername="Alice"
      />,
    )
    act(() => mockTurnstileOnSuccess('my-token'))

    await user.type(screen.getByLabelText('comments.form.username'), 'tester')
    await user.type(screen.getByLabelText('comments.form.body'), 'Reply!')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"parentId":"parent-id"'),
        }),
      )
    })
  })
})
