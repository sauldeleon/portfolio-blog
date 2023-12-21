import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { useDebounce } from './use-debounce'

function TestComponent({ initialValue = 0 }: { initialValue?: number }) {
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, 1000)
  return (
    <div>
      <button onClick={() => setValue(value + 1)}>Increment</button>
      <span data-testid="debouncedValue">{debouncedValue}</span>
      <span data-testid="value">{value}</span>
    </div>
  )
}

describe('useDebounce', function () {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce and only change value when delay time has passed', async () => {
    jest.useFakeTimers()
    render(<TestComponent />)
    const incrementButton = screen.getByText('Increment')
    const debouncedValue = screen.getByTestId('debouncedValue')
    const value = screen.getByTestId('value')

    const incrementAndPassTime = async (passedTime: number) => {
      userEvent.click(incrementButton)
      jest.advanceTimersByTime(passedTime)
    }

    act(() => incrementAndPassTime(100))

    expect(debouncedValue.textContent).toBe('0')
    await waitFor(() => expect(value.textContent).toBe('1'))

    act(() => incrementAndPassTime(500))

    expect(debouncedValue.textContent).toBe('0')
    await waitFor(() => expect(value.textContent).toBe('2'))

    act(() => incrementAndPassTime(999))

    expect(debouncedValue.textContent).toBe('0')
    await waitFor(() => expect(value.textContent).toBe('3'))

    act(() => {
      jest.advanceTimersByTime(100)
    })

    await waitFor(() => expect(debouncedValue.textContent).toBe('3'))
    expect(value.textContent).toBe('3')
  })
})

describe('Initial Value of DebouncedValue', function () {
  it('should set initial value', function () {
    render(<TestComponent key="1" initialValue={1} />)
    expect(screen.getByTestId('debouncedValue').textContent).toBe('1')
    expect(screen.getByTestId('value').textContent).toBe('1')
  })
})
