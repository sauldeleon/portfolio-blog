import { render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'

import { TrackEditor } from '../TrackEditor'
import { TrackEditorLoader } from './TrackEditorLoader'

vi.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../TrackEditor', () => ({
  TrackEditor: ({ path }: { path: string }) => (
    <div data-testid="track-editor">{path}</div>
  ),
}))

vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (
    load: () => Promise<{ default: ComponentType<{ path: string }> }>,
    { loading: Loading }: { loading: ComponentType },
  ) => {
    void load()
    // Resolve the dynamic import synchronously via the mocked module.
    return function Dynamic({ path }: { path: string }) {
      return (
        <>
          <Loading />
          <TrackEditor path={path} />
        </>
      )
    }
  },
}))

describe('TrackEditorLoader', () => {
  it('renders the client-only editor and its loading state', () => {
    render(<TrackEditorLoader path="a.gpx" />)
    expect(screen.getByTestId('track-editor')).toHaveTextContent('a.gpx')
    expect(screen.getByTestId('track-editor-loading')).toHaveTextContent(
      'tracks.editor.loading',
    )
  })
})
