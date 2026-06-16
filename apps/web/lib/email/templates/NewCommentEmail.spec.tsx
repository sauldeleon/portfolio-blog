/**
 * @jest-environment node
 */

/* eslint-disable testing-library/render-result-naming-convention */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { NewCommentEmail } from './NewCommentEmail'

const props = {
  username: 'tester',
  body: 'Great post!',
  postTitle: 'My Awesome Post',
  postUrl: 'https://sawl.dev/en/blog/1/my-awesome-post',
  adminUrl: 'https://sawl.dev/admin/comments',
  siteUrl: 'https://sawl.dev',
}

describe('NewCommentEmail', () => {
  it('renders without crashing', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toBeTruthy()
  })

  it('contains the username', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toContain('tester')
  })

  it('contains the comment body', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toContain('Great post!')
  })

  it('contains the post title', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toContain('My Awesome Post')
  })

  it('contains the admin link', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toContain('https://sawl.dev/admin/comments')
  })

  it('contains the site url', () => {
    const html = renderToStaticMarkup(
      React.createElement(NewCommentEmail, props),
    )
    expect(html).toContain('sawl.dev')
  })
})
