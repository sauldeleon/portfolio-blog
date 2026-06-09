import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { SubscribeModal } from './SubscribeModal'

jest.mock('@web/components/SubscribeForm', () => ({
  SubscribeForm: ({ lng }: { lng: string }) => (
    <div data-testid="subscribe-form" data-lng={lng} />
  ),
}))

jest.mock('@sdlgr/modal', () => ({
  Modal: ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    setIsOpen: (v: boolean) => void
    children: React.ReactNode
  }) => (isOpen ? <div role="dialog">{children}</div> : null),
}))

describe('SubscribeModal', () => {
  it('renders trigger button', () => {
    const { baseElement } = renderApp(
      <SubscribeModal
        lng="en"
        buttonLabel="Subscribe"
        buttonAriaLabel="Subscribe to blog"
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Subscribe to blog' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('opens modal on button click', async () => {
    renderApp(
      <SubscribeModal
        lng="en"
        buttonLabel="Subscribe"
        buttonAriaLabel="Subscribe to blog"
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Subscribe to blog' }),
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('subscribe-form')).toHaveAttribute(
      'data-lng',
      'en',
    )
  })
})
