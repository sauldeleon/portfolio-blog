import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { renderApp } from '@sdlgr/test-utils'

import { CategoryForm } from './CategoryForm'

const mockPush = jest.fn()
const mockBack = jest.fn()
const mockRefresh = jest.fn()

jest.mock('@web/i18n/client', () => ({
  useClientTranslation: jest.fn().mockReturnValue({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'categories.form.name': 'Name',
        'categories.form.namePlaceholder': 'e.g. Engineering',
        'categories.form.slug': 'Slug',
        'categories.form.slugHelper':
          'Auto-generated from name. Only lowercase letters, numbers and hyphens.',
        'categories.form.description': 'Description',
        'categories.form.descriptionPlaceholder': 'Optional',
        'categories.form.create': 'Create category',
        'categories.form.back': '← Back to categories',
        'categories.form.error': 'Something went wrong, please try again',
        'categories.cancel': 'Cancel',
        'categories.slugPlaceholder': 'my-category',
      }
      return translations[key] ?? key
    },
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

function setup() {
  renderApp(
    <CategoryForm title="New Category" backLabel="← Back to categories" />,
  )
}

describe('CategoryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      refresh: mockRefresh,
    })
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201 })
  })

  it('renders title and back link', () => {
    setup()
    expect(
      screen.getByRole('heading', { name: 'New Category' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('back-link')).toBeInTheDocument()
  })

  it('renders name, slug, description fields and submit button', () => {
    setup()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('slug-input')).toBeInTheDocument()
    expect(screen.getByTestId('description-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('submit button is disabled when name and slug are empty', () => {
    setup()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('submit button is enabled when name is filled (slug auto-generates)', () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    expect(screen.getByTestId('submit-button')).not.toBeDisabled()
  })

  it('auto-generates slug from name as user types', () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'My Category' },
    })
    expect(screen.getByTestId('slug-input')).toHaveValue('my-category')
  })

  it('stops auto-generating slug once user manually edits it', () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'My Category' },
    })
    fireEvent.change(screen.getByTestId('slug-input'), {
      target: { value: 'custom-slug' },
    })
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'My Category Updated' },
    })
    expect(screen.getByTestId('slug-input')).toHaveValue('custom-slug')
  })

  it('submits form with name, slug and description', async () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.change(screen.getByTestId('description-input'), {
      target: { value: 'Tech content' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(global.fetch).toHaveBeenCalledWith('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        translations: {
          en: {
            name: 'Engineering',
            slug: 'engineering',
            description: 'Tech content',
          },
        },
      }),
    })
  })

  it('submits without description when field is empty', async () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const body = JSON.parse(
      ((global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit])[1]
        .body as string,
    ) as { translations: { en: { description?: string } } }
    expect(body.translations.en.description).toBeUndefined()
  })

  it('navigates to /admin/categories on success', async () => {
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/admin/categories'),
    )
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows string error message on API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Slug already exists' }),
    })
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(await screen.findByTestId('form-error')).toHaveTextContent(
      'Slug already exists',
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows fallback error when API error is not a string', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: [{ message: 'invalid' }] }),
    })
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(await screen.findByTestId('form-error')).toHaveTextContent(
      'Something went wrong, please try again',
    )
  })

  it('shows fallback error when API returns non-JSON body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input')
      },
    })
    setup()
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'Engineering' },
    })
    fireEvent.click(screen.getByTestId('submit-button'))
    expect(await screen.findByTestId('form-error')).toHaveTextContent(
      'Something went wrong, please try again',
    )
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
