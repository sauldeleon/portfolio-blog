import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PublishNotifyModal } from './PublishNotifyModal'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'publishNotify.message': 'Do you want to notify subscribers?',
        'publishNotify.publishAndNotify': 'Publish & Notify',
        'publishNotify.publishOnly': 'Publish Only',
        'publishNotify.cancel': 'Cancel',
      }
      return translations[key] ?? key
    },
  }),
}))

describe('PublishNotifyModal', () => {
  it('renders message and all buttons when open', () => {
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={vi.fn()}
        onPublishOnly={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.getByText('Do you want to notify subscribers?'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('publish-notify-publish-and-notify'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('publish-notify-publish-only'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('publish-notify-cancel')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    renderApp(
      <PublishNotifyModal
        isOpen={false}
        onPublishAndNotify={vi.fn()}
        onPublishOnly={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.queryByText('Do you want to notify subscribers?'),
    ).not.toBeInTheDocument()
  })

  it('calls onPublishAndNotify when Publish & Notify clicked', () => {
    const onPublishAndNotify = vi.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={onPublishAndNotify}
        onPublishOnly={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
    expect(onPublishAndNotify).toHaveBeenCalledTimes(1)
  })

  it('calls onPublishOnly when Publish Only clicked', () => {
    const onPublishOnly = vi.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={vi.fn()}
        onPublishOnly={onPublishOnly}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
    expect(onPublishOnly).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = vi.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={vi.fn()}
        onPublishOnly={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
