import { render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'

import { TrackEditorLoader } from './TrackEditorLoader'

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock('../TrackEditor', () => ({
  TrackEditor: ({ path }: { path: string }) => (
    <div data-testid="track-editor">{path}</div>
  ),
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (
    load: () => Promise<{ default: ComponentType<{ path: string }> }>,
    { loading: Loading }: { loading: ComponentType },
  ) => {
    // Resolve the dynamic import synchronously via the mocked module.
    const mod = jest.requireMock('../TrackEditor') as {
      TrackEditor: ComponentType<{ path: string }>
    }
    void load()
    return function Dynamic({ path }: { path: string }) {
      return (
        <>
          <Loading />
          <mod.TrackEditor path={path} />
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
