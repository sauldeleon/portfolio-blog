/**
 * @jest-environment node
 */

/* eslint-disable testing-library/render-result-naming-convention */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { NewPostEmail } from './NewPostEmail'

const baseProps = {
  postTitle: 'My Great Post',
  postExcerpt: 'A brief excerpt about this post.',
  postUrl: 'https://example.com/en/blog/1/my-great-post',
  unsubscribeUrl: 'https://example.com/en/subscribe/unsubscribed?token=tok',
  siteUrl: 'https://example.com',
  previewText: 'New post from sawl.dev',
  greeting: "Hi John, there's a new post.",
  teaser: 'New post',
  heading: 'NEW POST',
  buttonLabel: 'Read more',
  footerText: 'You are subscribed.',
  unsubscribeText: 'Unsubscribe',
}

describe('NewPostEmail', () => {
  it('renders with required props only', () => {
    expect(
      renderToStaticMarkup(React.createElement(NewPostEmail, baseProps)),
    ).toMatchSnapshot()
  })

  it('renders greeting text', () => {
    expect(
      renderToStaticMarkup(React.createElement(NewPostEmail, baseProps)),
    ).toContain('Hi John, there&#x27;s a new post.')
  })

  it('renders with coverImageUrl', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(NewPostEmail, {
          ...baseProps,
          coverImageUrl:
            'https://res.cloudinary.com/cloud/image/upload/post.jpg',
        }),
      ),
    ).toContain('https://res.cloudinary.com/cloud/image/upload/post.jpg')
  })

  it('renders with category', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(NewPostEmail, {
          ...baseProps,
          category: 'engineering',
        }),
      ),
    ).toContain('ENGINEERING')
  })

  it('renders with tags', () => {
    const result = renderToStaticMarkup(
      React.createElement(NewPostEmail, {
        ...baseProps,
        tags: ['REACT', 'TYPESCRIPT', 'NEXTJS'],
      }),
    )
    expect(result).toContain('#REACT')
    expect(result).toContain('#TYPESCRIPT')
    expect(result).toContain('#NEXTJS')
  })

  it('renders with seriesTitle and seriesOrder', () => {
    const result = renderToStaticMarkup(
      React.createElement(NewPostEmail, {
        ...baseProps,
        seriesTitle: 'React Hooks',
        seriesOrder: 2,
      }),
    )
    expect(result).toContain('PART 2')
    expect(result).toContain('REACT HOOKS')
  })

  it('renders with seriesTitle only (no seriesOrder)', () => {
    const result = renderToStaticMarkup(
      React.createElement(NewPostEmail, {
        ...baseProps,
        seriesTitle: 'React Hooks',
        seriesOrder: null,
      }),
    )
    expect(result).toContain('REACT HOOKS')
    expect(result).not.toContain('PART')
  })

  it('renders with seriesOrder only (no seriesTitle)', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(NewPostEmail, { ...baseProps, seriesOrder: 3 }),
      ),
    ).toContain('PART 3')
  })
})
