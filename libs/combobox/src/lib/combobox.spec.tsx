import { render, screen } from '@testing-library/react'

import { RenderProviders } from '@sdlgr/test-utils'

import { Combobox } from './combobox'

const mockCreatableSelect = jest.fn()
jest.mock('react-select/creatable', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockCreatableSelect(props)
    return null
  },
}))

describe('Combobox', () => {
  beforeEach(() => {
    mockCreatableSelect.mockClear()
  })

  function renderCombobox(
    overrides?: Partial<React.ComponentProps<typeof Combobox>>,
  ) {
    const onChange = jest.fn()
    render(
      <Combobox
        value={[]}
        onChange={onChange}
        options={['typescript', 'react']}
        data-testid="combobox"
        {...overrides}
      />,
      { wrapper: RenderProviders },
    )
    return { onChange }
  }

  it('renders wrapper with data-testid', () => {
    renderCombobox()
    expect(screen.getByTestId('combobox')).toBeInTheDocument()
  })

  it('maps string options to react-select option objects', () => {
    renderCombobox({ options: ['typescript', 'react'] })
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          { value: 'typescript', label: 'typescript' },
          { value: 'react', label: 'react' },
        ],
      }),
    )
  })

  it('maps string value array to react-select value objects', () => {
    renderCombobox({ value: ['typescript'] })
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        value: [{ value: 'typescript', label: 'typescript' }],
      }),
    )
  })

  it('passes empty array value when no values selected', () => {
    renderCombobox({ value: [] })
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: [] }),
    )
  })

  it('calls onChange with string array when options are selected', () => {
    const { onChange } = renderCombobox()
    const { onChange: rsOnChange } = mockCreatableSelect.mock.calls[0][0] as {
      onChange: (selected: Array<{ value: string }>) => void
    }
    rsOnChange([{ value: 'react' }, { value: 'typescript' }])
    expect(onChange).toHaveBeenCalledWith(['react', 'typescript'])
  })

  it('formats create label with quotes', () => {
    renderCombobox()
    const { formatCreateLabel } = mockCreatableSelect.mock.calls[0][0] as {
      formatCreateLabel: (inputValue: string) => string
    }
    expect(formatCreateLabel('my tag')).toBe('Create "my tag"')
  })

  it('passes placeholder prop', () => {
    renderCombobox({ placeholder: 'Add tags…' })
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({ placeholder: 'Add tags…' }),
    )
  })

  it('passes isMulti true', () => {
    renderCombobox()
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isMulti: true }),
    )
  })

  function getIsValidNewOption() {
    const props = mockCreatableSelect.mock.calls[0][0] as {
      isValidNewOption: (
        inputValue: string,
        _val: unknown,
        opts: Array<{ value: string; label: string }>,
      ) => boolean
    }
    return props.isValidNewOption
  }

  const opts = [
    { value: 'TYPESCRIPT', label: 'TYPESCRIPT' },
    { value: 'REACT', label: 'REACT' },
  ]

  it('always passes isValidNewOption to CreatableSelect', () => {
    renderCombobox()
    const props = mockCreatableSelect.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(props).toHaveProperty('isValidNewOption')
    expect(typeof props.isValidNewOption).toBe('function')
  })

  it('returns false for blank input', () => {
    renderCombobox()
    const fn = getIsValidNewOption()
    expect(fn('', null, opts)).toBe(false)
    expect(fn('   ', null, opts)).toBe(false)
  })

  it('returns false when option already exists (exact match)', () => {
    renderCombobox()
    const fn = getIsValidNewOption()
    expect(fn('TYPESCRIPT', null, opts)).toBe(false)
  })

  it('returns false when option already exists (case-insensitive match)', () => {
    renderCombobox()
    const fn = getIsValidNewOption()
    expect(fn('typescript', null, opts)).toBe(false)
    expect(fn('TypeScript', null, opts)).toBe(false)
  })

  it('returns true for a new value not in options when no consumer validator', () => {
    renderCombobox()
    const fn = getIsValidNewOption()
    expect(fn('vue', null, opts)).toBe(true)
  })

  it('delegates to consumer isValidNewOption for format validation', () => {
    const isValidNewOption = jest.fn().mockReturnValue(false)
    renderCombobox({ isValidNewOption })
    const fn = getIsValidNewOption()
    expect(fn('vue', null, opts)).toBe(false)
    expect(isValidNewOption).toHaveBeenCalledWith('vue')
  })

  it('passes trimmed value to consumer isValidNewOption', () => {
    const isValidNewOption = jest.fn().mockReturnValue(true)
    renderCombobox({ isValidNewOption })
    const fn = getIsValidNewOption()
    fn('  vue  ', null, opts)
    expect(isValidNewOption).toHaveBeenCalledWith('vue')
  })
})
