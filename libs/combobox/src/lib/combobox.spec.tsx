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

  it('passes isValidNewOption when provided', () => {
    const isValidNewOption = jest.fn().mockReturnValue(true)
    renderCombobox({ isValidNewOption })
    expect(mockCreatableSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isValidNewOption }),
    )
  })

  it('does not pass isValidNewOption when not provided', () => {
    renderCombobox()
    const props = mockCreatableSelect.mock.calls[0][0] as Record<
      string,
      unknown
    >
    expect(props).not.toHaveProperty('isValidNewOption')
  })
})
