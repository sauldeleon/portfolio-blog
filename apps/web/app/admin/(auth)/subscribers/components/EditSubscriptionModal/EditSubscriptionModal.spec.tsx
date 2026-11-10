import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { EditSubscriptionModal } from './EditSubscriptionModal'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

const subscription = {
  id: 's1',
  email: 'ana@example.com',
  name: 'Ana',
  status: 'active' as const,
  locale: 'es' as const,
  createdAt: new Date('2024-01-01'),
  confirmedAt: null,
  enabled: true,
}

describe('EditSubscriptionModal', () => {
  it('renders title, email and the prefilled form', () => {
    renderApp(
      <EditSubscriptionModal
        subscription={subscription}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('subscribers.editTitle')).toBeInTheDocument()
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('subscribers.form.name')).toHaveValue('Ana')
    expect(
      screen.getByTestId('edit-subscription-locale-select'),
    ).toHaveTextContent('subscribers.form.localeOptions.es')
  })

  it('calls onSave with the edited values', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderApp(
      <EditSubscriptionModal
        subscription={subscription}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText('subscribers.form.name'), {
      target: { value: 'Ana M.' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'subscribers.form.save' }),
    )
    expect(await screen.findByRole('status')).toBeInTheDocument()
    expect(onSave).toHaveBeenCalledWith({ name: 'Ana M.', locale: 'es' })
  })

  it('calls onClose from the cancel button', () => {
    const onClose = vi.fn()
    renderApp(
      <EditSubscriptionModal
        subscription={subscription}
        onSave={vi.fn()}
        onClose={onClose}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'subscribers.form.cancel' }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    renderApp(
      <EditSubscriptionModal
        subscription={subscription}
        onSave={vi.fn()}
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 })
    expect(onClose).toHaveBeenCalled()
  })
})
