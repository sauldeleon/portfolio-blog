import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import type { AdminSubscriptionRecord } from '@web/lib/db/queries/subscriptions'

import { PAGE_LIMIT, SubscribersTable } from './SubscribersTable'

const mockPush = vi.fn()
const mockReplace = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/admin/subscribers/',
  useSearchParams: () => mockSearchParams,
}))

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: vi.fn().mockReturnValue({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        refresh: 'Refresh',
        'subscribers.empty': 'No subscribers yet',
        'subscribers.noResults': 'No subscribers match your search',
        'subscribers.searchPlaceholder': 'Search by name…',
        'subscribers.enabled': 'Enabled',
        'subscribers.disabled': 'Disabled',
        'subscribers.table.name': 'Name',
        'subscribers.table.email': 'Email',
        'subscribers.table.status': 'Status',
        'subscribers.table.locale': 'Locale',
        'subscribers.table.createdAt': 'Date',
        'subscribers.table.enabled': 'Receives emails',
        'subscribers.table.actions': 'Actions',
        'subscribers.edit': 'Edit',
        'subscribers.status.pending': 'Pending',
        'subscribers.status.active': 'Active',
        'subscribers.status.unsubscribed': 'Unsubscribed',
        'pagination.previous': 'Prev',
        'pagination.next': 'Next',
        'subscribers.inactiveHint': 'Only active subscribers receive emails',
      }
      if (key === 'subscribers.count')
        return `${String(opts?.count)} of ${String(opts?.total)} receiving`
      if (key === 'subscribers.toggleLabel')
        return `Send emails to ${String(opts?.email)}`
      return map[key] ?? key
    },
  }),
}))

const makeSubscription = (
  overrides: Partial<AdminSubscriptionRecord> = {},
): AdminSubscriptionRecord => ({
  id: 's1',
  email: 'reader@example.com',
  name: 'Reader',
  status: 'active',
  locale: 'en',
  createdAt: new Date('2024-01-15'),
  confirmedAt: new Date('2024-01-16'),
  enabled: true,
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockSearchParams = new URLSearchParams()
  vi.spyOn(axios, 'get').mockResolvedValue({ data: { subscriptions: [] } })
  vi.spyOn(axios, 'patch').mockResolvedValue({ data: {} })
})

describe('SubscribersTable', () => {
  it('renders subscriber rows', () => {
    renderApp(<SubscribersTable initialSubscriptions={[makeSubscription()]} />)
    expect(screen.getByTestId('subscriber-row')).toBeInTheDocument()
    expect(screen.getByText('Reader')).toBeInTheDocument()
    expect(screen.getByText('reader@example.com')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('15/01/2024')).toBeInTheDocument()
  })

  it('renders pending and unsubscribed status badges', () => {
    renderApp(
      <SubscribersTable
        initialSubscriptions={[
          makeSubscription({ id: 's2', status: 'pending' }),
          makeSubscription({ id: 's3', status: 'unsubscribed' }),
        ]}
      />,
    )
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Unsubscribed')).toBeInTheDocument()
  })

  it('disables the toggle for non-active subscribers', () => {
    renderApp(
      <SubscribersTable
        initialSubscriptions={[
          makeSubscription({ id: 's1', status: 'active' }),
          makeSubscription({ id: 's2', status: 'pending' }),
          makeSubscription({ id: 's3', status: 'unsubscribed' }),
        ]}
      />,
    )
    const [active, pending, unsubscribed] =
      screen.getAllByTestId('enabled-checkbox')
    expect(active).not.toBeDisabled()
    expect(pending).toBeDisabled()
    expect(unsubscribed).toBeDisabled()
    expect(
      screen.getAllByTitle('Only active subscribers receive emails'),
    ).toHaveLength(2)
  })

  it('renders empty state', () => {
    renderApp(<SubscribersTable initialSubscriptions={[]} />)
    expect(screen.getByText('No subscribers yet')).toBeInTheDocument()
  })

  it('shows count of active enabled subscribers', () => {
    renderApp(
      <SubscribersTable
        initialSubscriptions={[
          makeSubscription(),
          makeSubscription({ id: 's2', enabled: false }),
          makeSubscription({ id: 's3', status: 'pending' }),
        ]}
      />,
    )
    expect(screen.getByTestId('subscribers-count')).toHaveTextContent(
      '1 of 3 receiving',
    )
  })

  it('renders checkbox checked for enabled and unchecked for disabled', () => {
    renderApp(
      <SubscribersTable
        initialSubscriptions={[
          makeSubscription(),
          makeSubscription({
            id: 's2',
            email: 'b@example.com',
            enabled: false,
          }),
        ]}
      />,
    )
    const [first, second] = screen.getAllByTestId('enabled-checkbox')
    expect(first).toBeChecked()
    expect(second).not.toBeChecked()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Send emails to b@example.com'),
    ).toBeInTheDocument()
  })

  it('disables a subscription when unchecked', async () => {
    renderApp(<SubscribersTable initialSubscriptions={[makeSubscription()]} />)
    const checkbox = screen.getByTestId('enabled-checkbox')
    fireEvent.click(checkbox)
    expect(axios.patch).toHaveBeenCalledWith('/api/subscriptions/s1', {
      enabled: false,
    })
    await waitFor(() => expect(checkbox).not.toBeChecked())
    await waitFor(() => expect(checkbox).not.toBeDisabled())
  })

  it('enables a subscription when checked', async () => {
    renderApp(
      <SubscribersTable
        initialSubscriptions={[makeSubscription({ enabled: false })]}
      />,
    )
    const checkbox = screen.getByTestId('enabled-checkbox')
    fireEvent.click(checkbox)
    expect(axios.patch).toHaveBeenCalledWith('/api/subscriptions/s1', {
      enabled: true,
    })
    await waitFor(() => expect(checkbox).toBeChecked())
  })

  it('reverts the toggle when the request fails', async () => {
    vi.mocked(axios.patch).mockRejectedValueOnce(new Error('fail'))
    renderApp(<SubscribersTable initialSubscriptions={[makeSubscription()]} />)
    const checkbox = screen.getByTestId('enabled-checkbox')
    fireEvent.click(checkbox)
    await waitFor(() => expect(checkbox).not.toBeDisabled())
    expect(checkbox).toBeChecked()
  })

  it('refetches subscriptions on refresh', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { subscriptions: [makeSubscription({ name: 'Fresh' })] },
    })
    renderApp(<SubscribersTable initialSubscriptions={[]} />)
    fireEvent.click(screen.getByTestId('refresh-button'))
    expect(axios.get).toHaveBeenCalledWith('/api/subscriptions')
    expect(await screen.findByText('Fresh')).toBeInTheDocument()
  })

  describe('pagination', () => {
    const many = Array.from({ length: PAGE_LIMIT + 5 }, (_, i) =>
      makeSubscription({ id: `s${i}`, email: `u${i}@example.com` }),
    )
    const pagination = () =>
      screen.queryByRole('navigation', { name: 'pagination' })

    it('hides pagination when everything fits on one page', () => {
      renderApp(
        <SubscribersTable initialSubscriptions={[makeSubscription()]} />,
      )
      expect(pagination()).not.toBeInTheDocument()
    })

    it('shows the first page and counts every subscriber', () => {
      renderApp(<SubscribersTable initialSubscriptions={many} />)
      expect(pagination()).toBeInTheDocument()
      expect(screen.getAllByTestId('subscriber-row')).toHaveLength(PAGE_LIMIT)
      expect(screen.getByTestId('subscribers-count')).toHaveTextContent(
        `${PAGE_LIMIT + 5} of ${PAGE_LIMIT + 5} receiving`,
      )
    })

    it('shows the page from the URL', () => {
      mockSearchParams = new URLSearchParams('page=2')
      renderApp(<SubscribersTable initialSubscriptions={many} />)
      expect(screen.getAllByTestId('subscriber-row')).toHaveLength(5)
    })

    it('navigates to the next page through the URL', () => {
      renderApp(<SubscribersTable initialSubscriptions={many} />)
      fireEvent.click(screen.getByRole('button', { name: 'Next' }))
      expect(mockPush).toHaveBeenCalledWith('/admin/subscribers/?page=2')
    })
  })

  describe('search', () => {
    const list = [
      makeSubscription({ id: 's1', name: 'José García', email: 'a@x.com' }),
      makeSubscription({ id: 's2', name: 'Ana López', email: 'b@x.com' }),
    ]

    it('filters by name ignoring case and accents', () => {
      renderApp(<SubscribersTable initialSubscriptions={list} />)
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: '  JOSE  ' },
      })
      expect(screen.getAllByTestId('subscriber-row')).toHaveLength(1)
      expect(screen.getByText('José García')).toBeInTheDocument()
      expect(screen.queryByText('Ana López')).not.toBeInTheDocument()
    })

    it('does not match by email', () => {
      renderApp(<SubscribersTable initialSubscriptions={list} />)
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'b@x.com' },
      })
      expect(
        screen.getByText('No subscribers match your search'),
      ).toBeInTheDocument()
    })

    it('resets to the first page when searching', () => {
      mockSearchParams = new URLSearchParams('page=2')
      renderApp(
        <SubscribersTable initialSubscriptions={[makeSubscription()]} />,
      )
      fireEvent.change(screen.getByTestId('search-input'), {
        target: { value: 'Reader' },
      })
      expect(mockReplace).toHaveBeenCalledWith('/admin/subscribers/')
    })
  })

  describe('edit', () => {
    it('opens the edit modal, saves and updates the row', async () => {
      renderApp(
        <SubscribersTable initialSubscriptions={[makeSubscription()]} />,
      )
      fireEvent.click(screen.getByTestId('edit-button'))
      expect(
        await screen.findByTestId('edit-subscription-modal'),
      ).toBeInTheDocument()

      fireEvent.change(screen.getByDisplayValue('Reader'), {
        target: { value: 'Renamed' },
      })
      fireEvent.click(
        screen.getByRole('button', { name: 'subscribers.form.save' }),
      )

      await waitFor(() =>
        expect(
          screen.queryByTestId('edit-subscription-modal'),
        ).not.toBeInTheDocument(),
      )
      expect(axios.patch).toHaveBeenCalledWith('/api/subscriptions/s1', {
        name: 'Renamed',
        locale: 'en',
      })
      expect(screen.getByText('Renamed')).toBeInTheDocument()
    })

    it('keeps the modal open when saving fails', async () => {
      vi.mocked(axios.patch).mockRejectedValueOnce(new Error('fail'))
      renderApp(
        <SubscribersTable initialSubscriptions={[makeSubscription()]} />,
      )
      fireEvent.click(screen.getByTestId('edit-button'))
      fireEvent.click(
        await screen.findByRole('button', { name: 'subscribers.form.save' }),
      )
      expect(
        await screen.findByText('subscribers.form.error'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('edit-subscription-modal')).toBeInTheDocument()
    })

    it('closes the modal on cancel', async () => {
      renderApp(
        <SubscribersTable initialSubscriptions={[makeSubscription()]} />,
      )
      fireEvent.click(screen.getByTestId('edit-button'))
      fireEvent.click(
        await screen.findByRole('button', { name: 'subscribers.form.cancel' }),
      )
      expect(
        screen.queryByTestId('edit-subscription-modal'),
      ).not.toBeInTheDocument()
    })
  })
})
