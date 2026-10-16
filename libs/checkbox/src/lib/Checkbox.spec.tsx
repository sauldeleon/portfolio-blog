import { fireEvent, screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders with label', () => {
    renderWithTheme(
      <Checkbox
        id="cb"
        label="Use default"
        checked={false}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Use default')).toBeInTheDocument()
  })

  it('renders without label', () => {
    renderWithTheme(<Checkbox id="cb" checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('native input is checked when checked=true', () => {
    renderWithTheme(<Checkbox id="cb" checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('native input is unchecked when checked=false', () => {
    renderWithTheme(<Checkbox id="cb" checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('calls onChange with true when clicking unchecked', () => {
    const onChange = vi.fn()
    renderWithTheme(<Checkbox id="cb" checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicking checked', () => {
    const onChange = vi.fn()
    renderWithTheme(<Checkbox id="cb" checked={true} onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('is disabled when disabled prop passed', () => {
    renderWithTheme(
      <Checkbox id="cb" checked={false} onChange={vi.fn()} disabled />,
    )
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    renderWithTheme(
      <Checkbox id="cb" checked={false} onChange={onChange} disabled />,
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('label htmlFor matches input id', () => {
    renderWithTheme(
      <Checkbox
        id="my-checkbox"
        label="Test"
        checked={false}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-checkbox')
    expect(screen.getByLabelText('Test')).toHaveAttribute('id', 'my-checkbox')
  })

  it('forwards extra props to native input', () => {
    renderWithTheme(
      <Checkbox
        id="cb"
        checked={false}
        onChange={vi.fn()}
        data-testid="my-cb"
      />,
    )
    expect(screen.getByTestId('my-cb')).toBeInTheDocument()
  })
})
