import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import {
  SubscriptionDetailsForm,
  type SubscriptionDetailsFormLabels,
} from './index'

const labels: SubscriptionDetailsFormLabels = {
  name: 'Name',
  locale: 'Email language',
  localeOptions: { en: 'English', es: 'Español' },
  submit: 'Save',
  submitting: 'Saving...',
  success: 'Saved!',
  error: 'Could not save',
  cancel: 'Cancel',
}

function setup(
  props: Partial<Parameters<typeof SubscriptionDetailsForm>[0]> = {},
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  renderApp(
    <SubscriptionDetailsForm
      idPrefix="test"
      defaultValues={{ name: 'Ana', locale: 'es' }}
      labels={labels}
      onSubmit={onSubmit}
      {...props}
    />,
  )
  return { onSubmit: (props.onSubmit as typeof onSubmit) ?? onSubmit }
}

describe('SubscriptionDetailsForm', () => {
  it('renders fields with default values', () => {
    setup()
    expect(screen.getByLabelText('Name')).toHaveValue('Ana')
    expect(screen.getByTestId('test-locale-select')).toHaveTextContent(
      'Español',
    )
  })

  it('submits trimmed values and shows success', async () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  Ana María  ' },
    })
    fireEvent.keyDown(screen.getByLabelText('Email language'), {
      key: 'ArrowDown',
    })
    fireEvent.click(await screen.findByText('English'))
    expect(screen.getByTestId('test-locale-select')).toHaveTextContent(
      'English',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Saved!')
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana María', locale: 'en' })
  })

  it('shows a validation error for a blank name', async () => {
    const { onSubmit } = setup()
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows the error label when saving fails', async () => {
    setup({ onSubmit: vi.fn().mockRejectedValue(new Error('fail')) })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save')
  })

  it('shows the submitting label while saving', async () => {
    let resolve: () => void = () => undefined
    setup({
      onSubmit: vi.fn(
        () =>
          new Promise<void>((r) => {
            resolve = r
          }),
      ),
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(
      await screen.findByRole('button', { name: 'Saving...' }),
    ).toBeDisabled()
    resolve()
    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('renders a cancel button only when onCancel is given', () => {
    const onCancel = vi.fn()
    setup({ onCancel })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('hides the cancel button without onCancel', () => {
    setup()
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument()
  })

  it('renders the admin variant with the same fields and actions', async () => {
    const { onSubmit } = setup({ variant: 'admin', onCancel: vi.fn() })
    expect(screen.getByLabelText('Name')).toHaveValue('Ana')
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Saved!')
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', locale: 'es' })
  })
})
