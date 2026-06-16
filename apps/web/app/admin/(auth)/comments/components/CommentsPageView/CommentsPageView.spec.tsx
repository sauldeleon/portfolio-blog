import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CommentsPageView } from './CommentsPageView'

jest.mock('../CommentsTable', () => ({
  CommentsTable: () => <div data-testid="comments-table-mock" />,
}))

describe('CommentsPageView', () => {
  it('renders the page with title', () => {
    renderApp(<CommentsPageView initialComments={[]} title="Comments" />)
    expect(screen.getByTestId('admin-comments-page')).toBeInTheDocument()
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })

  it('renders the CommentsTable', () => {
    renderApp(<CommentsPageView initialComments={[]} title="Comments" />)
    expect(screen.getByTestId('comments-table-mock')).toBeInTheDocument()
  })
})
