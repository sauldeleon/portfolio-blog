import { render, screen } from '@testing-library/react'

import { RenderProviders } from '@sdlgr/test-utils'

import { Select } from './select'

const mockReactSelect = jest.fn()
const mockCreatableReactSelect = jest.fn()

jest.mock('react-select', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockReactSelect(props)
    return null
  },
}))

jest.mock('react-select/creatable', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockCreatableReactSelect(props)
    return null
  },
}))

const options = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'travel', label: 'Travel', disabled: true },
]

function renderSelect(
  overrides?: Partial<React.ComponentProps<typeof Select>>,
) {
  const onChange = jest.fn()
  render(
    <Select
      value=""
      onChange={onChange}
      options={options}
      data-testid="select"
      {...overrides}
    />,
    { wrapper: RenderProviders },
  )
  return { onChange }
}

describe('Select', () => {
  beforeEach(() => {
    mockReactSelect.mockClear()
    mockCreatableReactSelect.mockClear()
  })

  it('renders wrapper with data-testid', () => {
    renderSelect()
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  it('passes null as value when value is empty string', () => {
    renderSelect({ value: '' })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ value: null }),
    )
  })

  it('synthesizes selected option when value not in options (e.g. newly created)', () => {
    renderSelect({ value: 'custom-new-value' })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        value: {
          value: 'custom-new-value',
          label: 'custom-new-value',
          isDisabled: undefined,
        },
      }),
    )
  })

  it('passes matched option object as value', () => {
    renderSelect({ value: 'engineering' })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        value: {
          value: 'engineering',
          label: 'Engineering',
          isDisabled: undefined,
        },
      }),
    )
  })

  it('maps disabled options to isDisabled true', () => {
    renderSelect()
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([
          { value: 'travel', label: 'Travel', isDisabled: true },
        ]),
      }),
    )
  })

  it('calls onChange with string value when option selected', () => {
    const { onChange } = renderSelect()
    const { onChange: rsOnChange } = mockReactSelect.mock.calls[0][0] as {
      onChange: (option: { value: string; label: string } | null) => void
    }
    rsOnChange({ value: 'engineering', label: 'Engineering' })
    expect(onChange).toHaveBeenCalledWith('engineering')
  })

  it('calls onChange with empty string when cleared', () => {
    const { onChange } = renderSelect()
    const { onChange: rsOnChange } = mockReactSelect.mock.calls[0][0] as {
      onChange: (option: { value: string; label: string } | null) => void
    }
    rsOnChange(null)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('passes isClearable false by default', () => {
    renderSelect()
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isClearable: false }),
    )
  })

  it('passes isClearable true when set', () => {
    renderSelect({ isClearable: true })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isClearable: true }),
    )
  })

  it('passes custom placeholder', () => {
    renderSelect({ placeholder: 'Pick one' })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ placeholder: 'Pick one' }),
    )
  })

  it('passes default placeholder when none specified', () => {
    renderSelect({ placeholder: undefined })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ placeholder: '—' }),
    )
  })

  it('forwards id as inputId', () => {
    renderSelect({ id: 'my-select' })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ inputId: 'my-select' }),
    )
  })

  it('uses ReactSelect by default when isCreatable is false', () => {
    renderSelect()
    expect(mockReactSelect).toHaveBeenCalled()
    expect(mockCreatableReactSelect).not.toHaveBeenCalled()
  })

  it('uses CreatableReactSelect when isCreatable is true', () => {
    renderSelect({ isCreatable: true })
    expect(mockCreatableReactSelect).toHaveBeenCalled()
    expect(mockReactSelect).not.toHaveBeenCalled()
  })

  it('passes isSearchable false by default', () => {
    renderSelect()
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isSearchable: false }),
    )
  })

  it('passes isSearchable true when set', () => {
    renderSelect({ isSearchable: true })
    expect(mockReactSelect).toHaveBeenCalledWith(
      expect.objectContaining({ isSearchable: true }),
    )
  })
})
