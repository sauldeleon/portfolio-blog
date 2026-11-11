import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ADMIN_PAGE_SIZE } from '@web/app/admin/(auth)/hooks/useUrlPagination'

import { AdminPagination } from './AdminPagination'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@sdlgr/pagination', () => ({
  Pagination: (props: Record<string, unknown>) => (
    <div data-testid="pagination" data-props={JSON.stringify(props)} />
  ),
}))

describe('AdminPagination', () => {
  it('renders the shared pagination with the admin page size and labels', () => {
    renderApp(<AdminPagination total={45} page={2} />)
    expect(
      JSON.parse(
        screen.getByTestId('pagination').getAttribute('data-props') ?? '{}',
      ),
    ).toEqual({
      total: 45,
      page: 2,
      limit: ADMIN_PAGE_SIZE,
      previousLabel: 'pagination.previous',
      nextLabel: 'pagination.next',
    })
  })
})
