import { fireEvent, screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { SeriesForm } from './SeriesForm'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'series.form.id': 'Series ID',
        'series.form.idPlaceholder': 'my-series',
        'series.form.idHelper': 'Unique identifier',
        'series.form.enTitle': 'English title',
        'series.form.enTitlePlaceholder': 'My series title',
        'series.form.esTitle': 'Spanish title (optional)',
        'series.form.esTitlePlaceholder': 'Título de la serie',
        'series.form.create': 'Create series',
        'series.form.error': 'Something went wrong, please try again',
        'series.cancel': 'Cancel',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

function setup() {
  renderApp(<SeriesForm title="New series" backLabel="← Back to series" />)
}

describe('SeriesForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      refresh: mockRefresh,
    })
    jest.spyOn(axios, 'post').mockResolvedValue({ data: {} })
  })

  it('renders title and back link', () => {
    setup()
    expect(
      screen.getByRole('heading', { name: 'New series' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('back-link')).toBeInTheDocument()
  })

  it('renders all form fields and submit button', () => {
    setup()
    expect(screen.getByTestId('en-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('id-input')).toBeInTheDocument()
    expect(screen.getByTestId('es-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('submit button is disabled when fields are empty', () => {
    setup()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('auto-generates id from EN title', () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    expect(screen.getByTestId('id-input')).toHaveValue('my-series')
  })

  it('enables submit when EN title and id are filled', () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
  })

  it('stops auto-generating id once manually edited', () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.change(screen.getByTestId('id-input'), {
      target: { value: 'custom-id' },
    })
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series Updated' },
    })
    expect(screen.getByTestId('id-input')).toHaveValue('custom-id')
  })

  it('submits with id, EN title and ES title', async () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.change(screen.getByTestId('es-title-input'), {
      target: { value: 'Mi Serie' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(axios.post).toHaveBeenCalledWith('/api/series', {
      id: 'my-series',
      translations: { en: 'My Series', es: 'Mi Serie' },
    })
  })

  it('submits without ES translation when field is empty', async () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    const body = (axios.post as jest.Mock).mock.calls[0][1] as {
      translations: Record<string, string>
    }
    expect(body.translations.es).toBeUndefined()
  })

  it('navigates to /admin/series on success', async () => {
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/series'))
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows string error on API failure', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(
      new AxiosError('error', '409', undefined, undefined, {
        status: 409,
        data: { error: "Series 'my-series' already exists" },
        statusText: 'Conflict',
        headers: {},
        config: {} as never,
      }),
    )
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(await screen.findByTestId('form-error')).toHaveTextContent(
      "Series 'my-series' already exists",
    )
  })

  it('shows fallback error when API error is not a string', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(
      new AxiosError('error', '400', undefined, undefined, {
        status: 400,
        data: { error: [{ message: 'invalid' }] },
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
      }),
    )
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(await screen.findByTestId('form-error')).toHaveTextContent(
      'Something went wrong, please try again',
    )
  })

  it('silently ignores non-axios errors', async () => {
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('Network timeout'))
    setup()
    fireEvent.change(screen.getByTestId('en-title-input'), {
      target: { value: 'My Series' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(screen.queryByTestId('form-error')).not.toBeInTheDocument()
  })

  it('back link calls router.back()', () => {
    setup()
    fireEvent.click(screen.getByTestId('back-link'))
    expect(mockBack).toHaveBeenCalled()
  })

  it('cancel link calls router.back()', () => {
    setup()
    fireEvent.click(screen.getByTestId('cancel-link'))
    expect(mockBack).toHaveBeenCalled()
  })
})
