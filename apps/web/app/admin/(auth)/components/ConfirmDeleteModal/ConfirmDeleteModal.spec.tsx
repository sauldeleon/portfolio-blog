import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ConfirmDeleteModal } from './ConfirmDeleteModal'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'confirmDelete.confirm': 'Delete',
        'confirmDelete.cancel': 'Cancel',
      }
      return translations[key] ?? key
    },
  }),
}))

describe('ConfirmDeleteModal', () => {
  it('renders message when open', () => {
    renderApp(
      <ConfirmDeleteModal
        isOpen
        message="Delete this category?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.getByText('Delete this category?')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons when open', () => {
    renderApp(
      <ConfirmDeleteModal
        isOpen
        message="Delete this?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.getByTestId('confirm-delete-confirm')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-delete-cancel')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    renderApp(
      <ConfirmDeleteModal
        isOpen={false}
        message="Delete this?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.queryByText('Delete this?')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = jest.fn()
    renderApp(
      <ConfirmDeleteModal
        isOpen
        message="Delete this?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn()
    renderApp(
      <ConfirmDeleteModal
        isOpen
        message="Delete this?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
