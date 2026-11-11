import { fireEvent, screen } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { ManageSubscriptionPage } from './ManageSubscriptionPage'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, opts?: { email?: string }) =>
      opts?.email ? `${key}:${opts.email}` : key,
  }),
}))

vi.mock('next/link', () => ({
  default: function MockLink({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode
    href: string
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  },
}))

const baseProps = {
  lng: 'es' as const,
  token: 'tok 1',
  expires: '123',
  signature: 'sig',
  email: 'ana@example.com',
  status: 'active' as const,
  defaultValues: { name: 'Ana', locale: 'es' as const },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
})

describe('ManageSubscriptionPage', () => {
  it('renders title, email and the prefilled form', () => {
    renderApp(<ManageSubscriptionPage {...baseProps} />)
    expect(screen.getByText('manage.title')).toBeInTheDocument()
    expect(
      screen.getByText('manage.subtitle:ana@example.com'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('nameLabel')).toHaveValue('Ana')
    expect(
      screen.getByTestId('manage-subscription-locale-select'),
    ).toHaveTextContent('manage.locale.es')
  })

  it('saves changes through the manage API with the token', async () => {
    renderApp(<ManageSubscriptionPage {...baseProps} />)
    fireEvent.change(screen.getByLabelText('nameLabel'), {
      target: { value: 'Ana María' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'manage.submit' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'manage.success',
    )
    expect(axios.patch).toHaveBeenCalledWith('/api/subscribe/manage/', {
      token: 'tok 1',
      expires: '123',
      signature: 'sig',
      name: 'Ana María',
      locale: 'es',
    })
  })

  it('links to unsubscribe with the encoded token', () => {
    renderApp(<ManageSubscriptionPage {...baseProps} />)
    expect(screen.getByTestId('manage-unsubscribe-link')).toHaveAttribute(
      'href',
      '/es/subscribe/unsubscribed?token=tok%201',
    )
    expect(screen.getByText('backToBlog')).toHaveAttribute('href', '/es/blog')
  })

  it('hides the unsubscribe link when already unsubscribed', () => {
    renderApp(<ManageSubscriptionPage {...baseProps} status="unsubscribed" />)
    expect(
      screen.queryByTestId('manage-unsubscribe-link'),
    ).not.toBeInTheDocument()
  })
})
