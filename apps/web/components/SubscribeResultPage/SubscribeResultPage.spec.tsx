import { render, screen } from '@testing-library/react'

import { SubscribeResultPage } from './SubscribeResultPage'

jest.mock(
  'next/link',
  () =>
    function MockLink({
      children,
      href,
    }: {
      children: React.ReactNode
      href: string
    }) {
      return <a href={href}>{children}</a>
    },
)

jest.mock(
  'next/image',
  () =>
    function MockImage({ src, alt }: { src: string; alt: string }) {
      return <img src={src} alt={alt} />
    },
)

const baseProps = {
  successTitle: 'Success!',
  successMessage: 'You are subscribed.',
  errorTitle: 'Something went wrong.',
  backToLabel: 'Back to blog',
  backToHref: '/en/blog',
}

describe('SubscribeResultPage', () => {
  it('shows success title and message when success is true', () => {
    render(<SubscribeResultPage {...baseProps} success={true} />)
    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByText('You are subscribed.')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument()
  })

  it('shows error title and no message when success is false', () => {
    render(<SubscribeResultPage {...baseProps} success={false} />)
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.queryByText('Success!')).not.toBeInTheDocument()
    expect(screen.queryByText('You are subscribed.')).not.toBeInTheDocument()
  })

  it('renders back to blog link with correct href', () => {
    render(<SubscribeResultPage {...baseProps} success={true} />)
    const link = screen.getByRole('link', { name: 'Back to blog' })
    expect(link).toHaveAttribute('href', '/en/blog')
  })

  it('renders image when success is true and imageSrc is provided', () => {
    render(
      <SubscribeResultPage
        {...baseProps}
        success={true}
        imageSrc="/test.png"
        imageAlt="success illustration"
      />,
    )
    expect(screen.getByAltText('success illustration')).toBeInTheDocument()
  })

  it('does not render image when success is false', () => {
    render(
      <SubscribeResultPage
        {...baseProps}
        success={false}
        imageSrc="/test.png"
        imageAlt="success illustration"
      />,
    )
    expect(
      screen.queryByAltText('success illustration'),
    ).not.toBeInTheDocument()
  })

  it('renders without image when imageSrc is omitted', () => {
    render(<SubscribeResultPage {...baseProps} success={true} />)
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('renders image with empty alt when imageAlt is omitted', () => {
    render(
      <SubscribeResultPage
        {...baseProps}
        success={true}
        imageSrc="/test.png"
      />,
    )
    expect(screen.getByAltText('')).toBeInTheDocument()
  })
})
