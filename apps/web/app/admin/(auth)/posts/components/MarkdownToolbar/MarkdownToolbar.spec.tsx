import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { MarkdownToolbar, shortcutFor } from './MarkdownToolbar'

describe('MarkdownToolbar', () => {
  it('formats with each button and opens the link modal', () => {
    const onFormat = jest.fn()
    const onLink = jest.fn()
    renderApp(<MarkdownToolbar onFormat={onFormat} onLink={onLink} />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('format-bold'))
    fireEvent.click(screen.getByTestId('format-hr'))
    expect(onFormat.mock.calls).toEqual([['bold'], ['hr']])
    fireEvent.click(screen.getByTestId('format-link'))
    expect(onLink).toHaveBeenCalled()
    expect(onFormat).toHaveBeenCalledTimes(2)
  })

  it('keeps the editor selection when pressing a button', () => {
    renderApp(<MarkdownToolbar onFormat={jest.fn()} onLink={jest.fn()} />)
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })
    screen.getByTestId('format-italic').dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('shortcutFor', () => {
  const key = (k: string, mods: Partial<KeyboardEvent> = {}) =>
    shortcutFor({
      key: k,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      ...mods,
    })

  it('maps Ctrl/Cmd shortcuts', () => {
    expect(key('b', { ctrlKey: true })).toBe('bold')
    expect(key('I', { metaKey: true })).toBe('italic')
    expect(key('k', { ctrlKey: true })).toBe('link')
  })

  it('ignores other keys and combinations', () => {
    expect(key('b')).toBeNull()
    expect(key('b', { ctrlKey: true, altKey: true })).toBeNull()
    expect(key('z', { ctrlKey: true })).toBeNull()
  })
})
