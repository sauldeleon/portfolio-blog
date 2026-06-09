/**
 * @jest-environment node
 */

/* eslint-disable testing-library/render-result-naming-convention */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ConfirmSubscriptionEmail } from './ConfirmSubscription'

const baseProps = {
  name: 'Alice',
  confirmUrl: 'https://example.com/confirm?token=abc',
  unsubscribeUrl: 'https://example.com/unsubscribe?token=abc',
  siteUrl: 'https://example.com',
  previewText: 'Please confirm your subscription',
  heading: 'Confirm your subscription',
  body: 'Hello {{name}}, please click below',
  buttonLabel: 'Confirm',
  footerText: 'You are receiving this because you signed up.',
  unsubscribeText: 'Unsubscribe',
}

describe('ConfirmSubscriptionEmail', () => {
  it('renders without blogImageUrl', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(ConfirmSubscriptionEmail, baseProps),
      ),
    ).toMatchSnapshot()
  })

  it('renders with blogImageUrl', () => {
    const withImage = {
      ...baseProps,
      blogImageUrl: 'https://example.com/cover.jpg',
    }
    expect(
      renderToStaticMarkup(
        React.createElement(ConfirmSubscriptionEmail, withImage),
      ),
    ).toContain('https://example.com/cover.jpg')
    expect(
      renderToStaticMarkup(
        React.createElement(ConfirmSubscriptionEmail, withImage),
      ),
    ).toMatchSnapshot()
  })

  it('replaces {{name}} placeholder in body', () => {
    const result = renderToStaticMarkup(
      React.createElement(ConfirmSubscriptionEmail, baseProps),
    )
    expect(result).toContain('Hello Alice, please click below')
    expect(result).not.toContain('{{name}}')
  })
})
