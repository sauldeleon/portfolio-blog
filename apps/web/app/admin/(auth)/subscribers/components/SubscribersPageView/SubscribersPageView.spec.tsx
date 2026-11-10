import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { SubscribersPageView } from './SubscribersPageView'

vi.mock('../SubscribersTable', () => ({
  SubscribersTable: () => <div data-testid="subscribers-table-mock" />,
}))

describe('SubscribersPageView', () => {
  it('renders the page with title', () => {
    renderApp(
      <SubscribersPageView initialSubscriptions={[]} title="Subscribers" />,
    )
    expect(screen.getByTestId('admin-subscribers-page')).toBeInTheDocument()
    expect(screen.getByText('Subscribers')).toBeInTheDocument()
  })

  it('renders the SubscribersTable', () => {
    renderApp(
      <SubscribersPageView initialSubscriptions={[]} title="Subscribers" />,
    )
    expect(screen.getByTestId('subscribers-table-mock')).toBeInTheDocument()
  })
})
