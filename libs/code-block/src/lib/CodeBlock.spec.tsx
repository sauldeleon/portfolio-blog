import { act, fireEvent, screen } from '@testing-library/react'

import { renderWithTheme } from '@sdlgr/test-utils'

import { CodeBlock } from './CodeBlock'

const mockWriteText = jest.fn()

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
  })
})

beforeEach(() => {
  jest.useFakeTimers()
  mockWriteText.mockResolvedValue(undefined)
})

afterEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
})

describe('CodeBlock', () => {
  it('renders children', () => {
    renderWithTheme(
      <CodeBlock copyLabel="Copy" copiedLabel="Copied!">
        <code>const x = 1</code>
      </CodeBlock>,
    )
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  it('renders language label when provided', () => {
    renderWithTheme(
      <CodeBlock
        copyLabel="Copy"
        copiedLabel="Copied!"
        data-language="typescript"
      >
        <code>const x = 1</code>
      </CodeBlock>,
    )
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('does not render language label when not provided', () => {
    renderWithTheme(
      <CodeBlock copyLabel="Copy" copiedLabel="Copied!">
        <code>const x = 1</code>
      </CodeBlock>,
    )
    expect(screen.queryByText('typescript')).not.toBeInTheDocument()
  })

  it('renders copy button with copyLabel', () => {
    renderWithTheme(
      <CodeBlock copyLabel="Copy" copiedLabel="Copied!">
        <code>hello</code>
      </CodeBlock>,
    )
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('copies text and shows copiedLabel on click', async () => {
    renderWithTheme(
      <CodeBlock copyLabel="Copy" copiedLabel="Copied!">
        <code>const x = 1</code>
      </CodeBlock>,
    )
    const button = screen.getByRole('button', { name: 'Copy' })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(button)
    })
    expect(mockWriteText).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
  })

  it('reverts to copyLabel after 2 seconds', async () => {
    renderWithTheme(
      <CodeBlock copyLabel="Copy" copiedLabel="Copied!">
        <code>const x = 1</code>
      </CodeBlock>,
    )
    const button = screen.getByRole('button', { name: 'Copy' })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(button)
    })
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })
})
