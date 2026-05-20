import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { DateTimePicker } from './DateTimePicker'

jest.mock('react-day-picker', () => ({
  DayPicker: ({
    onSelect,
    selected,
  }: {
    onSelect: (d: Date | undefined) => void
    selected?: Date
  }) => (
    <div data-testid="mock-day-picker">
      <button
        type="button"
        data-testid="mock-select-day"
        onClick={() => onSelect(new Date('2024-06-15T00:00:00.000Z'))}
      >
        Select Day
      </button>
      <button
        type="button"
        data-testid="mock-clear-day"
        onClick={() => onSelect(undefined)}
      >
        Clear Day
      </button>
      {selected && (
        <span data-testid="mock-selected-date">{selected.toISOString()}</span>
      )}
    </div>
  ),
}))

describe('DateTimePicker', () => {
  const noop = () => undefined

  describe('trigger', () => {
    it('shows placeholder when no value', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      expect(screen.getByTestId('datetime-picker-trigger')).toHaveTextContent(
        'Not scheduled',
      )
    })

    it('shows custom placeholder', () => {
      renderApp(
        <DateTimePicker
          value={null}
          onChange={noop}
          placeholder="Pick a date"
        />,
      )
      expect(screen.getByTestId('datetime-picker-trigger')).toHaveTextContent(
        'Pick a date',
      )
    })

    it('shows formatted date when value provided', () => {
      const date = new Date(2024, 5, 15)
      renderApp(<DateTimePicker value={date} onChange={noop} />)
      const trigger = screen.getByTestId('datetime-picker-trigger')
      expect(trigger.textContent).toMatch(/15 Jun 2024/)
    })

    it('uses custom data-testid', () => {
      renderApp(
        <DateTimePicker value={null} onChange={noop} data-testid="sched" />,
      )
      expect(screen.getByTestId('sched-trigger')).toBeInTheDocument()
    })
  })

  describe('popover', () => {
    it('popover hidden by default', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      expect(
        screen.queryByTestId('datetime-picker-popover'),
      ).not.toBeInTheDocument()
    })

    it('opens popover on trigger click', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      expect(screen.getByTestId('datetime-picker-popover')).toBeInTheDocument()
    })

    it('toggles popover on subsequent trigger clicks', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      expect(
        screen.queryByTestId('datetime-picker-popover'),
      ).not.toBeInTheDocument()
    })

    it('shows calendar when open', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      expect(screen.getByTestId('mock-day-picker')).toBeInTheDocument()
    })

    it('shows clear button when open', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      expect(screen.getByTestId('datetime-picker-clear')).toBeInTheDocument()
    })
  })

  describe('day selection', () => {
    it('calls onChange with date at midnight', () => {
      const onChange = jest.fn()
      renderApp(<DateTimePicker value={null} onChange={onChange} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('mock-select-day'))
      const called = onChange.mock.calls[0][0] as Date
      expect(called).toBeInstanceOf(Date)
      expect(called.getHours()).toBe(0)
      expect(called.getMinutes()).toBe(0)
      expect(called.getSeconds()).toBe(0)
    })

    it('closes popover after day selected', () => {
      renderApp(<DateTimePicker value={null} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('mock-select-day'))
      expect(
        screen.queryByTestId('datetime-picker-popover'),
      ).not.toBeInTheDocument()
    })

    it('calls onChange(null) when day cleared via calendar', () => {
      const onChange = jest.fn()
      renderApp(
        <DateTimePicker
          value={new Date('2024-06-15T10:00:00.000Z')}
          onChange={onChange}
        />,
      )
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('mock-clear-day'))
      expect(onChange).toHaveBeenCalledWith(null)
    })

    it('passes selected date to calendar', () => {
      const date = new Date('2024-06-15T10:00:00.000Z')
      renderApp(<DateTimePicker value={date} onChange={noop} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      expect(screen.getByTestId('mock-selected-date')).toBeInTheDocument()
    })
  })

  describe('clear button', () => {
    it('calls onChange(null) and closes popover', () => {
      const onChange = jest.fn()
      renderApp(
        <DateTimePicker
          value={new Date('2024-06-15T10:00:00.000Z')}
          onChange={onChange}
        />,
      )
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('datetime-picker-clear'))
      expect(onChange).toHaveBeenCalledWith(null)
      expect(
        screen.queryByTestId('datetime-picker-popover'),
      ).not.toBeInTheDocument()
    })

    it('closes popover even when value is null', () => {
      renderApp(<DateTimePicker value={null} onChange={jest.fn()} />)
      fireEvent.click(screen.getByTestId('datetime-picker-trigger'))
      fireEvent.click(screen.getByTestId('datetime-picker-clear'))
      expect(
        screen.queryByTestId('datetime-picker-popover'),
      ).not.toBeInTheDocument()
    })
  })
})
