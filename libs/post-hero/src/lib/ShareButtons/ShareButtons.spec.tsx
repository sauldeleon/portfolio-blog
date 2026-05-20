import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { ShareButtons } from './ShareButtons'

const mockWriteText = jest.fn()

Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  configurable: true,
})

const defaultProps = {
  url: 'https://example.com/post',
  title: 'My Post Title',
}

describe('ShareButtons', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockWriteText.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders all platform links', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Facebook' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Telegram' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email' })).toBeInTheDocument()
  })

  it('renders copy link button', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    renderWithTheme(<ShareButtons {...defaultProps} label="Share" />)
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.queryByTestId('share-label')).not.toBeInTheDocument()
  })

  it('uses custom copyLinkLabel', () => {
    renderWithTheme(<ShareButtons {...defaultProps} copyLinkLabel="Copy URL" />)
    expect(screen.getByRole('button', { name: 'Copy URL' })).toBeInTheDocument()
  })

  it('all social links open in new tab', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('LinkedIn link contains linkedin.com', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      expect.stringContaining('linkedin.com'),
    )
  })

  it('Facebook link contains facebook.com', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      expect.stringContaining('facebook.com'),
    )
  })

  it('WhatsApp link contains wa.me', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me'),
    )
  })

  it('Telegram link contains t.me', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
      'href',
      expect.stringContaining('t.me'),
    )
  })

  it('Email link is a mailto href', () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    )
  })

  it('copies url to clipboard on copy button click', async () => {
    renderWithTheme(<ShareButtons {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/post')
    })
  })

  it('shows copiedLabel after clicking copy', async () => {
    renderWithTheme(<ShareButtons {...defaultProps} copiedLabel="Copied!" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(
      await screen.findByRole('button', { name: 'Copied!' }),
    ).toBeInTheDocument()
  })

  it('shows copied pill with text after clicking copy', async () => {
    renderWithTheme(<ShareButtons {...defaultProps} copiedLabel="Copied!" />)
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('hides copied pill after 2 seconds', async () => {
    renderWithTheme(<ShareButtons {...defaultProps} copiedLabel="Copied!" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    await screen.findByText('Copied!')
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })
  })

  it('reverts to copyLinkLabel after 2 seconds', async () => {
    renderWithTheme(<ShareButtons {...defaultProps} copiedLabel="Copied!" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    await screen.findByRole('button', { name: 'Copied!' })
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(
      await screen.findByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { baseElement } = renderWithTheme(
      <ShareButtons {...defaultProps} label="Share" />,
    )
    expect(baseElement).toMatchSnapshot()
  })
})
