import { fireEvent, render, screen } from '@testing-library/react'

import { RenderProviders } from '@sdlgr/test-utils'

import { Select } from './select'

const options = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'travel', label: 'Travel', disabled: true },
]

function renderSelect(props?: Partial<React.ComponentProps<typeof Select>>) {
  const onChange = jest.fn()
  const view = render(
    <Select
      value=""
      onChange={onChange}
      options={options}
      data-testid="select"
      {...props}
    />,
    { wrapper: RenderProviders },
  )
  return { ...view, onChange }
}

describe('Select', () => {
  it('shows placeholder when no value selected', () => {
    renderSelect()
    expect(screen.getByRole('button')).toHaveTextContent('—')
  })

  it('shows custom placeholder', () => {
    renderSelect({ placeholder: 'Pick one' })
    expect(screen.getByRole('button')).toHaveTextContent('Pick one')
  })

  it('shows selected label when value matches an option', () => {
    renderSelect({ value: 'engineering' })
    expect(screen.getByRole('button')).toHaveTextContent('Engineering')
  })

  it('dropdown is not visible initially', () => {
    renderSelect()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('opens dropdown on trigger click', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('renders all options in the dropdown', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    expect(
      screen.getByRole('option', { name: 'Engineering' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Design' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Travel' })).toBeInTheDocument()
  })

  it('calls onChange and closes dropdown on option click', () => {
    const { onChange } = renderSelect()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('option', { name: 'Engineering' }))
    expect(onChange).toHaveBeenCalledWith('engineering')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not call onChange on disabled option click', () => {
    const { onChange } = renderSelect()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('option', { name: 'Travel' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('toggles dropdown closed on second trigger click', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on outside click', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('marks selected option with aria-selected', () => {
    renderSelect({ value: 'design' })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('option', { name: 'Design' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('option', { name: 'Engineering' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('forwards id to trigger button', () => {
    renderSelect({ id: 'my-select' })
    expect(screen.getByRole('button')).toHaveAttribute('id', 'my-select')
  })

  it('forwards data-testid to wrapper', () => {
    renderSelect({ 'data-testid': 'custom-select' })
    expect(screen.getByTestId('custom-select')).toBeInTheDocument()
  })

  it('sets aria-expanded false when closed', () => {
    renderSelect()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('sets aria-expanded true when open', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('does not close on click inside wrapper', () => {
    renderSelect()
    fireEvent.click(screen.getByRole('button'))
    fireEvent.mouseDown(screen.getByRole('listbox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
})
