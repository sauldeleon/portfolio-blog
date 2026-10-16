import { screen, waitFor } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { TrackUrlPicker } from './TrackUrlPicker'

const mockFetchTrackFiles = vi.fn()
const mockSelect = vi.fn()

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key} ${JSON.stringify(options)}` : key,
  }),
}))

vi.mock('../../tracks/utils/trackApi', async () => ({
  ...(await vi.importActual<typeof import('../../tracks/utils/trackApi')>(
    '../../tracks/utils/trackApi',
  )),
  fetchTrackFiles: () => mockFetchTrackFiles(),
}))

vi.mock('@sdlgr/select', () => ({
  Select: (props: { 'data-testid'?: string }) => {
    mockSelect(props)
    return <div data-testid={props['data-testid']} />
  },
}))

type SelectProps = {
  id?: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  isSearchable: boolean
  isCreatable: boolean
  isClearable: boolean
  placeholder: string
  formatCreateLabel: (input: string) => string
}

const lastProps = () =>
  mockSelect.mock.calls[mockSelect.mock.calls.length - 1][0] as SelectProps

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchTrackFiles.mockResolvedValue({
    files: [
      { path: '2026-01-01 a.gpx', size: 1, rawUrl: 'https://raw/a.gpx' },
      { path: '2026-02-01 b.gpx', size: 1, rawUrl: 'https://raw/b.gpx' },
    ],
    truncated: false,
  })
})

describe('TrackUrlPicker', () => {
  it('offers the repo tracks newest first and accepts any URL', async () => {
    const onChange = vi.fn()
    renderApp(
      <TrackUrlPicker
        value="https://raw/b.gpx"
        onChange={onChange}
        id="gpx"
        data-testid="picker"
      />,
    )
    expect(screen.getByTestId('picker')).toBeInTheDocument()
    await waitFor(() =>
      expect(lastProps().options).toEqual([
        { value: 'https://raw/b.gpx', label: '2026-02-01 b.gpx' },
        { value: 'https://raw/a.gpx', label: '2026-01-01 a.gpx' },
      ]),
    )
    const props = lastProps()
    expect(props).toMatchObject({
      id: 'gpx',
      value: 'https://raw/b.gpx',
      isSearchable: true,
      isCreatable: true,
      isClearable: true,
      placeholder: 'tracks.picker.placeholder',
    })
    expect(props.formatCreateLabel('https://x.gpx')).toBe(
      'tracks.picker.useUrl {"url":"https://x.gpx"}',
    )
    props.onChange('https://raw/a.gpx')
    expect(onChange).toHaveBeenCalledWith('https://raw/a.gpx')
  })

  it('works without repo tracks and with a custom placeholder', () => {
    mockFetchTrackFiles.mockReturnValue(new Promise(() => undefined))
    renderApp(
      <TrackUrlPicker value="" onChange={vi.fn()} placeholder="Pick one" />,
    )
    expect(lastProps().options).toEqual([])
    expect(lastProps().placeholder).toBe('Pick one')
  })
})
