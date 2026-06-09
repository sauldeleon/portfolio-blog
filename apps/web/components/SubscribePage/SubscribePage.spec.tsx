import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { SubscribePage } from './SubscribePage'

jest.mock('@web/components/SubscribeForm', () => ({
  SubscribeForm: ({ lng }: { lng: string }) => (
    <div data-testid="subscribe-form" data-lng={lng} />
  ),
}))

describe('SubscribePage', () => {
  it('renders with SubscribeForm', () => {
    const { baseElement } = renderApp(<SubscribePage lng="en" />)
    expect(screen.getByTestId('subscribe-form')).toHaveAttribute(
      'data-lng',
      'en',
    )
    expect(baseElement).toMatchSnapshot()
  })
})
