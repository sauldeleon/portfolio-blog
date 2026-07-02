import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'

import { renderApp } from '@sdlgr/test-utils'

import { CroquisGenerator } from './CroquisGenerator'

function makeAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError('error', String(status), undefined, undefined, {
    status,
    data,
    statusText: 'Error',
    headers: {},
    config: {} as never,
  })
}

jest.mock('@web/i18n/client', () => {
  const admin: Record<string, unknown> = jest.requireActual(
    '@web/i18n/locales/en/admin.json',
  )
  return {
    useClientTranslation: () => ({
      t: (key: string): string => {
        const val = key
          .split('.')
          .reduce<unknown>(
            (o, k) =>
              typeof o === 'object' && o !== null
                ? (o as Record<string, unknown>)[k]
                : undefined,
            admin,
          )
        return typeof val === 'string' ? val : key
      },
    }),
  }
})

jest.mock('../Croquis', () => ({
  Croquis: ({
    obstacles,
    lang,
    filename,
  }: {
    obstacles: unknown[]
    lang: string
    filename: string
  }) => (
    <div data-testid="croquis-mock">
      <span data-testid="c-count">{obstacles.length}</span>
      <span data-testid="c-lang">{lang}</span>
      <span data-testid="c-filename">{filename}</span>
    </div>
  ),
}))

const JUMP_TEXT = 'salto: Jump 2m - 42.6092 0.1412'

describe('CroquisGenerator', () => {
  it('shows the empty hint until there are obstacles', () => {
    renderApp(<CroquisGenerator />)
    expect(screen.getByTestId('cg-empty')).toBeInTheDocument()
    expect(screen.queryByTestId('croquis-mock')).not.toBeInTheDocument()
  })

  it('draws the croquis once the text has drawable obstacles', () => {
    renderApp(<CroquisGenerator />)
    fireEvent.change(screen.getByTestId('cg-text'), {
      target: { value: JUMP_TEXT },
    })
    expect(screen.getByTestId('croquis-mock')).toBeInTheDocument()
    expect(screen.getByTestId('c-count')).toHaveTextContent('1')
    expect(screen.queryByTestId('cg-empty')).not.toBeInTheDocument()
  })

  it('ignores waypoints that are not drawable', () => {
    renderApp(<CroquisGenerator />)
    fireEvent.change(screen.getByTestId('cg-text'), {
      target: { value: 'info: Nice view - 42.6 0.14' },
    })
    expect(screen.getByTestId('cg-empty')).toBeInTheDocument()
  })

  it('names the file from the prefix and language', () => {
    renderApp(<CroquisGenerator />)
    fireEvent.change(screen.getByTestId('cg-text'), {
      target: { value: JUMP_TEXT },
    })
    fireEvent.change(screen.getByTestId('cg-name'), {
      target: { value: 'Mascún' },
    })
    expect(screen.getByTestId('c-filename')).toHaveTextContent(
      'croquis-mascun-en',
    )
  })

  it('switches the language', () => {
    renderApp(<CroquisGenerator />)
    fireEvent.change(screen.getByTestId('cg-text'), {
      target: { value: JUMP_TEXT },
    })
    fireEvent.click(screen.getByTestId('cg-lang-es'))
    expect(screen.getByTestId('c-lang')).toHaveTextContent('es')
    expect(screen.getByTestId('c-filename')).toHaveTextContent(
      'croquis-croquis-es',
    )
  })

  it('disables Parse until a url is entered', () => {
    renderApp(<CroquisGenerator />)
    expect(screen.getByTestId('cg-import')).toBeDisabled()
    fireEvent.change(screen.getByTestId('cg-gpx'), {
      target: { value: 'https://x/y.gpx' },
    })
    expect(screen.getByTestId('cg-import')).not.toBeDisabled()
  })

  describe('GPX import', () => {
    function enterUrl() {
      fireEvent.change(screen.getByTestId('cg-gpx'), {
        target: { value: 'https://x/y.gpx' },
      })
    }

    it('fills the textarea from parsed waypoints', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: { data: [{ categories: ['salto'], title: 'Jump', notes: [] }] },
      })
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      await screen.findByTestId('croquis-mock')
      expect(screen.getByTestId('c-count')).toHaveTextContent('1')
    })

    it('errors when the response has no data', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({ data: {} })
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      expect(await screen.findByTestId('cg-error')).toHaveTextContent(
        'Could not parse GPX file',
      )
    })

    it('errors when no waypoints are found', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({ data: { data: [] } })
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      expect(await screen.findByTestId('cg-error')).toHaveTextContent(
        'No waypoints found',
      )
    })

    it('shows the server error message', async () => {
      jest
        .spyOn(axios, 'get')
        .mockRejectedValue(makeAxiosError(400, { error: 'Bad GPX' }))
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      expect(await screen.findByTestId('cg-error')).toHaveTextContent('Bad GPX')
    })

    it('falls back to a generic error when the axios error has no message', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(makeAxiosError(500, {}))
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      expect(await screen.findByTestId('cg-error')).toHaveTextContent(
        'Could not parse GPX file',
      )
    })

    it('falls back to a generic error for non-axios failures', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('boom'))
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      expect(await screen.findByTestId('cg-error')).toHaveTextContent(
        'Could not parse GPX file',
      )
    })

    it('shows a parsing label while loading', async () => {
      let resolve!: (v: unknown) => void
      jest.spyOn(axios, 'get').mockReturnValue(
        new Promise((r) => {
          resolve = r
        }),
      )
      renderApp(<CroquisGenerator />)
      enterUrl()
      const button = screen.getByTestId('cg-import')
      fireEvent.click(button)
      await waitFor(() => expect(button).toHaveTextContent('Parsing…'))
      resolve({ data: { data: [] } })
      await waitFor(() => expect(button).toHaveTextContent('Parse'))
    })

    it('clears a previous error when the url changes', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({ data: {} })
      renderApp(<CroquisGenerator />)
      enterUrl()
      fireEvent.click(screen.getByTestId('cg-import'))
      await screen.findByTestId('cg-error')
      fireEvent.change(screen.getByTestId('cg-gpx'), {
        target: { value: 'https://x/z.gpx' },
      })
      expect(screen.queryByTestId('cg-error')).not.toBeInTheDocument()
    })
  })
})
