import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CardDateField } from './CardDateField'

jest.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect }: { onSelect: (d: Date | undefined) => void }) => (
    <button
      type="button"
      data-testid="mock-day"
      onClick={() => onSelect(new Date('2025-07-20T00:00:00.000Z'))}
    >
      Select Day
    </button>
  ),
}))

describe('CardDateField', () => {
  it('renders the picker with default testid', () => {
    renderApp(<CardDateField onChange={jest.fn()} />)
    expect(screen.getByTestId('card-date')).toBeInTheDocument()
  })

  it('uses a custom testid', () => {
    renderApp(<CardDateField onChange={jest.fn()} data-testid="rt-date" />)
    expect(screen.getByTestId('rt-date')).toBeInTheDocument()
  })

  it('shows placeholder when no value', () => {
    renderApp(<CardDateField onChange={jest.fn()} />)
    expect(screen.getByTestId('card-date-trigger')).toHaveTextContent(
      'Select date',
    )
  })

  it('shows placeholder when value is an unparseable string', () => {
    renderApp(<CardDateField value="not-a-date" onChange={jest.fn()} />)
    expect(screen.getByTestId('card-date-trigger')).toHaveTextContent(
      'Select date',
    )
  })

  it('displays a parsed value', () => {
    renderApp(<CardDateField value="15 Jul 2025" onChange={jest.fn()} />)
    expect(screen.getByTestId('card-date-trigger')).toHaveTextContent(
      '15 Jul 2025',
    )
  })

  it('emits a formatted string when a day is selected', () => {
    const onChange = jest.fn()
    renderApp(<CardDateField value="15 Jul 2025" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('card-date-trigger'))
    fireEvent.click(screen.getByTestId('mock-day'))
    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/\d{2} \w{3} \d{4}/),
    )
  })

  it('emits an empty string when the value is cleared', () => {
    const onChange = jest.fn()
    renderApp(<CardDateField value="15 Jul 2025" onChange={onChange} />)
    fireEvent.click(screen.getByTestId('card-date-trigger'))
    fireEvent.click(screen.getByTestId('card-date-clear'))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
