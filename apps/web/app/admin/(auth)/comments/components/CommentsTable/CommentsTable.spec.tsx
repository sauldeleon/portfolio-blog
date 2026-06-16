import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import type { CommentRecord } from '@web/lib/db/queries/comments'

import { CommentsTable } from './CommentsTable'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        refresh: 'Refresh',
        'comments.empty': 'No comments found',
        'comments.approve': 'Approve',
        'comments.reject': 'Reject',
        'comments.delete': 'Delete',
        'comments.deleteConfirm': 'Permanently delete this comment?',
        'comments.filters.all': 'All',
        'comments.filters.pending': 'Pending',
        'comments.filters.approved': 'Approved',
        'comments.filters.rejected': 'Rejected',
        'comments.table.username': 'User',
        'comments.table.body': 'Comment',
        'comments.table.status': 'Status',
        'comments.table.createdAt': 'Date',
        'comments.table.actions': 'Actions',
        'comments.status.pending': 'Pending',
        'comments.status.approved': 'Approved',
        'comments.status.rejected': 'Rejected',
        'confirmDelete.confirm': 'Confirm delete',
        'confirmDelete.cancel': 'Cancel delete',
        'comments.showMore': 'Show more',
        'comments.showLess': 'Show less',
      }
      return map[key] ?? key
    },
  }),
}))

const makeComment = (
  overrides: Partial<CommentRecord> = {},
): CommentRecord => ({
  id: 'c1',
  postId: 'p1',
  parentId: null,
  username: 'tester',
  body: 'Great post!',
  status: 'pending',
  createdAt: new Date('2024-01-15'),
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(axios, 'get').mockResolvedValue({ data: { comments: [] } })
  jest.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
  jest.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
})

describe('CommentsTable', () => {
  it('renders comment rows from initialComments', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('comment-row')).toBeInTheDocument()
    expect(screen.getByText('tester')).toBeInTheDocument()
    expect(screen.getByText('Great post!')).toBeInTheDocument()
  })

  it('renders empty state when no comments', () => {
    renderApp(<CommentsTable initialComments={[]} />)
    expect(screen.getByText('No comments found')).toBeInTheDocument()
  })

  it('renders status filters', () => {
    renderApp(<CommentsTable initialComments={[]} />)
    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-pending')).toBeInTheDocument()
    expect(screen.getByTestId('filter-approved')).toBeInTheDocument()
    expect(screen.getByTestId('filter-rejected')).toBeInTheDocument()
  })

  it('renders approve button for pending comment', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('approve-button')).toBeInTheDocument()
  })

  it('renders reject button for pending comment', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('reject-button')).toBeInTheDocument()
  })

  it('does not render approve button for approved comment', () => {
    renderApp(
      <CommentsTable initialComments={[makeComment({ status: 'approved' })]} />,
    )
    expect(screen.queryByTestId('approve-button')).not.toBeInTheDocument()
  })

  it('does not render reject button for rejected comment', () => {
    renderApp(
      <CommentsTable initialComments={[makeComment({ status: 'rejected' })]} />,
    )
    expect(screen.queryByTestId('reject-button')).not.toBeInTheDocument()
  })

  it('renders delete button for all comments', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
  })

  it('shows status badge', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Pending')
  })

  it('calls PATCH approve when approve clicked', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('approve-button'))
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/comments/c1', {
        status: 'approved',
      })
    })
  })

  it('calls PATCH reject when reject clicked', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('reject-button'))
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/comments/c1', {
        status: 'rejected',
      })
    })
  })

  it('opens confirm modal when delete clicked', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await waitFor(() => {
      expect(
        screen.getByText('Permanently delete this comment?'),
      ).toBeInTheDocument()
    })
  })

  it('calls DELETE and removes row on confirm delete', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await screen.findByText('Permanently delete this comment?')
    fireEvent.click(screen.getByText('Confirm delete'))
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/comments/c1')
    })
  })

  it('cancels delete modal without calling API', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('delete-button'))
    await screen.findByText('Permanently delete this comment?')
    fireEvent.click(screen.getByText('Cancel delete'))
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('changes filter when filter button clicked', async () => {
    renderApp(<CommentsTable initialComments={[]} />)
    fireEvent.click(screen.getByTestId('filter-approved'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('status=approved'),
      )
    })
  })

  it('fetches all comments when all filter selected', async () => {
    renderApp(<CommentsTable initialComments={[]} />)
    fireEvent.click(screen.getByTestId('filter-all'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments'),
      )
    })
  })

  it('renders refresh button', () => {
    renderApp(<CommentsTable initialComments={[]} />)
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
  })

  it('calls refetch when refresh button clicked', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('refresh-button'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled()
    })
  })

  // Expandable body
  it('renders expand toggle button', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('expand-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('expand-toggle')).toHaveTextContent('Show more')
  })

  it('toggles body expansion when expand toggle clicked', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('expand-toggle'))
    expect(screen.getByTestId('expand-toggle')).toHaveTextContent('Show less')
    fireEvent.click(screen.getByTestId('expand-toggle'))
    expect(screen.getByTestId('expand-toggle')).toHaveTextContent('Show more')
  })

  it('toggles body expansion when body text clicked', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByText('Great post!'))
    expect(screen.getByTestId('expand-toggle')).toHaveTextContent('Show less')
  })

  // Select / bulk
  it('renders row checkbox for each comment', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('row-checkbox')).toBeInTheDocument()
  })

  it('renders select-all checkbox', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.getByTestId('select-all-checkbox')).toBeInTheDocument()
  })

  it('does not show bulk actions when nothing selected', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('shows bulk actions when a row is selected', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument()
  })

  it('unchecking a row checkbox deselects it', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('row-checkbox'))
    expect(screen.getByTestId('row-checkbox')).not.toBeChecked()
    expect(screen.queryByTestId('bulk-actions')).not.toBeInTheDocument()
  })

  it('selects all rows when select-all clicked', () => {
    renderApp(
      <CommentsTable
        initialComments={[makeComment({ id: 'c1' }), makeComment({ id: 'c2' })]}
      />,
    )
    const checkboxes = screen.getAllByTestId('row-checkbox')
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    checkboxes.forEach((cb) => expect(cb).toBeChecked())
  })

  it('deselects all when select-all unchecked', () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('select-all-checkbox'))
    expect(screen.getByTestId('row-checkbox')).not.toBeChecked()
  })

  it('bulk approves selected comments', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-approve-button'))
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/comments/c1', {
        status: 'approved',
      })
    })
  })

  it('bulk rejects selected comments', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-reject-button'))
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith('/api/comments/c1', {
        status: 'rejected',
      })
    })
  })

  it('bulk deletes selected comments', async () => {
    renderApp(<CommentsTable initialComments={[makeComment()]} />)
    fireEvent.click(screen.getByTestId('row-checkbox'))
    fireEvent.click(screen.getByTestId('bulk-delete-button'))
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/comments/c1')
    })
  })
})
