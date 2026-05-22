import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { UsersPageView } from './UsersPageView'

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
  }) => {
    const currentLabel = options.find((o) => o.value === value)?.label ?? ''
    return (
      <div data-testid={testId}>
        <button type="button">{currentLabel}</button>
        {options.map((opt) => (
          <div
            key={opt.value}
            role="option"
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </div>
        ))}
      </div>
    )
  },
}))

const mockRouterRefresh = jest.fn()
const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRouterRefresh, push: mockRouterPush }),
}))

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const map: Record<string, string> = {
        refresh: 'Refresh',
        'users.newUser': 'New user',
        'users.searchPlaceholder': 'Search users…',
        'users.empty': 'No users found',
        'users.table.email': 'Email',
        'users.table.name': 'Name',
        'users.table.role': 'Role',
        'users.table.createdAt': 'Created',
        'users.table.updatedAt': 'Updated',
        'users.table.actions': 'Actions',
        'users.roles.admin': 'Admin',
        'users.roles.editor': 'Editor',
        'users.roles.user': 'User',
        'users.delete': 'Delete',
        'users.changeRole': 'Change role',
        'users.form.edit': 'Edit',
        'users.form.error': 'Something went wrong',
        'confirmDelete.confirm': 'Confirm',
        'confirmDelete.cancel': 'Cancel',
      }
      return map[key] ?? key
    },
  }),
}))

const now = new Date('2024-01-01T00:00:00.000Z')

const adminUser = {
  id: 'user-1',
  email: 'admin@example.com',
  role: 'admin' as const,
  name: 'Admin User',
  createdAt: now,
  updatedAt: now,
}

const editorUser = {
  id: 'user-2',
  email: 'editor@example.com',
  role: 'editor' as const,
  name: 'Editor User',
  createdAt: now,
  updatedAt: now,
}

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('UsersPageView', () => {
  it('renders page wrapper', () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    expect(screen.getByTestId('users-page')).toBeInTheDocument()
  })

  it('renders title', () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })

  it('renders refresh button', () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
  })

  it('calls router.refresh when refresh button clicked', async () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('refresh-button'))
    expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no users', () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    expect(screen.getByTestId('users-empty')).toBeInTheDocument()
  })

  it('renders user table with users', () => {
    renderApp(<UsersPageView users={[adminUser, editorUser]} title="Users" />)
    expect(screen.getByTestId('users-table')).toBeInTheDocument()
    expect(screen.getByTestId('user-row-user-1')).toBeInTheDocument()
    expect(screen.getByTestId('user-row-user-2')).toBeInTheDocument()
  })

  it('renders email and name columns', () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
  })

  it('renders updatedAt column', () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })

  it('renders user with role user', () => {
    const userRecord = {
      id: 'user-3',
      email: 'viewer@example.com',
      role: 'user' as const,
      name: 'Viewer',
      createdAt: now,
      updatedAt: now,
    }
    renderApp(<UsersPageView users={[userRecord]} title="Users" />)
    expect(screen.getByTestId('user-row-user-3')).toBeInTheDocument()
    expect(screen.getAllByText('User').length).toBeGreaterThan(0)
  })

  it('filters users by email via search input', async () => {
    renderApp(<UsersPageView users={[adminUser, editorUser]} title="Users" />)
    await userEvent.type(screen.getByTestId('search-input'), 'admin@')
    expect(screen.getByTestId('user-row-user-1')).toBeInTheDocument()
    expect(screen.queryByTestId('user-row-user-2')).not.toBeInTheDocument()
  })

  it('filters users by name via search input', async () => {
    renderApp(<UsersPageView users={[adminUser, editorUser]} title="Users" />)
    await userEvent.type(screen.getByTestId('search-input'), 'Admin User')
    expect(screen.getByTestId('user-row-user-1')).toBeInTheDocument()
    expect(screen.queryByTestId('user-row-user-2')).not.toBeInTheDocument()
  })

  it('shows empty state when search matches nothing', async () => {
    renderApp(<UsersPageView users={[adminUser, editorUser]} title="Users" />)
    await userEvent.type(screen.getByTestId('search-input'), 'zzznomatch')
    expect(screen.getByTestId('users-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('users-table')).not.toBeInTheDocument()
  })

  it('filters correctly when user has null name', async () => {
    const noNameUser = {
      ...editorUser,
      id: 'user-3',
      name: null,
      email: 'noname@example.com',
    }
    renderApp(<UsersPageView users={[noNameUser as never]} title="Users" />)
    await userEvent.type(screen.getByTestId('search-input'), 'nomatch')
    expect(screen.queryByTestId('user-row-user-3')).not.toBeInTheDocument()
  })

  it('navigates to /admin/users/new when New user button clicked', async () => {
    renderApp(<UsersPageView users={[]} title="Users" />)
    await userEvent.click(screen.getByTestId('new-user-button'))
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/users/new')
  })

  it('shows delete confirm buttons when delete clicked', async () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    expect(screen.getByTestId('delete-confirm-user-1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-cancel-user-1')).toBeInTheDocument()
  })

  it('cancels delete when cancel clicked', async () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    await userEvent.click(screen.getByTestId('delete-cancel-user-1'))
    expect(
      screen.queryByTestId('delete-confirm-user-1'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('delete-user-1')).toBeInTheDocument()
  })

  it('deletes user on confirm', async () => {
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: {} })
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    await userEvent.click(screen.getByTestId('delete-confirm-user-1'))
    await waitFor(() =>
      expect(screen.queryByTestId('user-row-user-1')).not.toBeInTheDocument(),
    )
  })

  it('shows alert when delete fails', async () => {
    jest
      .spyOn(axios, 'delete')
      .mockRejectedValue(
        makeAxiosError(422, { error: 'Cannot delete last admin' }),
      )
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    await userEvent.click(screen.getByTestId('delete-confirm-user-1'))
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith('Cannot delete last admin'),
    )
    alertMock.mockRestore()
  })

  it('shows fallback alert when delete fails with no error message', async () => {
    jest.spyOn(axios, 'delete').mockRejectedValue(makeAxiosError(500, {}))
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    await userEvent.click(screen.getByTestId('delete-confirm-user-1'))
    await waitFor(() => expect(alertMock).toHaveBeenCalled())
    alertMock.mockRestore()
  })

  it('shows fallback alert when delete fails with non-axios error', async () => {
    jest.spyOn(axios, 'delete').mockRejectedValue(new Error('Network failure'))
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('delete-user-1'))
    await userEvent.click(screen.getByTestId('delete-confirm-user-1'))
    await waitFor(() => expect(alertMock).toHaveBeenCalled())
    alertMock.mockRestore()
  })

  it('updates role via role select and updates all rows', async () => {
    jest.spyOn(axios, 'patch').mockResolvedValue({
      data: {
        ...adminUser,
        role: 'editor',
        createdAt: adminUser.createdAt.toISOString(),
        updatedAt: adminUser.updatedAt.toISOString(),
      },
    })
    renderApp(<UsersPageView users={[adminUser, editorUser]} title="Users" />)
    fireEvent.click(
      within(screen.getByTestId('role-select-user-1')).getByRole('option', {
        name: 'Editor',
      }),
    )
    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        '/api/users/user-1',
        expect.objectContaining({ role: 'editor' }),
      ),
    )
  })

  it('shows alert when role update fails', async () => {
    jest
      .spyOn(axios, 'patch')
      .mockRejectedValue(
        makeAxiosError(422, { error: 'Cannot demote last admin' }),
      )
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    fireEvent.click(
      within(screen.getByTestId('role-select-user-1')).getByRole('option', {
        name: 'Editor',
      }),
    )
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith('Cannot demote last admin'),
    )
    alertMock.mockRestore()
  })

  it('shows fallback alert when role update fails with no error message', async () => {
    jest.spyOn(axios, 'patch').mockRejectedValue(makeAxiosError(500, {}))
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    fireEvent.click(
      within(screen.getByTestId('role-select-user-1')).getByRole('option', {
        name: 'Editor',
      }),
    )
    await waitFor(() => expect(alertMock).toHaveBeenCalled())
    alertMock.mockRestore()
  })

  it('shows fallback alert when role update fails with non-axios error', async () => {
    jest.spyOn(axios, 'patch').mockRejectedValue(new Error('Network failure'))
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(jest.fn())
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    fireEvent.click(
      within(screen.getByTestId('role-select-user-1')).getByRole('option', {
        name: 'Editor',
      }),
    )
    await waitFor(() => expect(alertMock).toHaveBeenCalled())
    alertMock.mockRestore()
  })

  it('navigates to edit page when edit button clicked', async () => {
    renderApp(<UsersPageView users={[adminUser]} title="Users" />)
    await userEvent.click(screen.getByTestId('edit-user-user-1'))
    expect(mockRouterPush).toHaveBeenCalledWith('/admin/users/user-1')
  })
})
