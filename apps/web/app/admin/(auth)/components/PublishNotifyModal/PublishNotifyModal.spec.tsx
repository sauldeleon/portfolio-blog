import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { PublishNotifyModal } from './PublishNotifyModal'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
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
        onPublishAndNotify={jest.fn()}
        onPublishOnly={jest.fn()}
        onCancel={jest.fn()}
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
        onPublishAndNotify={jest.fn()}
        onPublishOnly={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(
      screen.queryByText('Do you want to notify subscribers?'),
    ).not.toBeInTheDocument()
  })

  it('calls onPublishAndNotify when Publish & Notify clicked', () => {
    const onPublishAndNotify = jest.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={onPublishAndNotify}
        onPublishOnly={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-publish-and-notify'))
    expect(onPublishAndNotify).toHaveBeenCalledTimes(1)
  })

  it('calls onPublishOnly when Publish Only clicked', () => {
    const onPublishOnly = jest.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={jest.fn()}
        onPublishOnly={onPublishOnly}
        onCancel={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-publish-only'))
    expect(onPublishOnly).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = jest.fn()
    renderApp(
      <PublishNotifyModal
        isOpen
        onPublishAndNotify={jest.fn()}
        onPublishOnly={jest.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByTestId('publish-notify-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
