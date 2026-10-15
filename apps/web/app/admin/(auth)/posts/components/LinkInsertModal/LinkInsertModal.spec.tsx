import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { LinkInsertModal, buildLinkMarkdown } from './LinkInsertModal'

function renderModal(props: { initialText?: string } = {}) {
  const callbacks = { onInsert: jest.fn(), onCancel: jest.fn() }
  renderApp(<LinkInsertModal isOpen {...callbacks} {...props} />)
  return callbacks
}

describe('buildLinkMarkdown', () => {
  it('builds a Markdown link, escaping brackets and parentheses', () => {
    expect(buildLinkMarkdown(' a [b] ', ' https://a.b/x (1) ')).toBe(
      '[a \\[b\\]](https://a.b/x%20%281%29)',
    )
  })

  it('falls back to the URL as text', () => {
    expect(buildLinkMarkdown('  ', 'https://a.b')).toBe(
      '[https://a.b](https://a.b)',
    )
  })
})

describe('LinkInsertModal', () => {
  it('renders nothing when closed', () => {
    renderApp(
      <LinkInsertModal
        isOpen={false}
        onInsert={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('link-url-input')).not.toBeInTheDocument()
  })

  it('needs a URL before inserting', () => {
    const { onInsert } = renderModal()
    expect(screen.getByTestId('link-modal-insert')).toBeDisabled()
    expect(screen.queryByTestId('link-preview')).not.toBeInTheDocument()
    fireEvent.submit(screen.getByTestId('link-url-input'))
    expect(onInsert).not.toHaveBeenCalled()
  })

  it('inserts a Markdown link with the selected text', () => {
    const { onInsert } = renderModal({ initialText: 'refugio' })
    expect(screen.getByTestId('link-text-input')).toHaveValue('refugio')
    fireEvent.change(screen.getByTestId('link-url-input'), {
      target: { value: 'https://a.b' },
    })
    expect(screen.getByTestId('link-preview')).toHaveTextContent(
      '[refugio](https://a.b)',
    )
    fireEvent.click(screen.getByTestId('link-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith('[refugio](https://a.b)')
  })

  it('inserts on submit with a custom text', () => {
    const { onInsert } = renderModal()
    fireEvent.change(screen.getByTestId('link-url-input'), {
      target: { value: 'https://a.b' },
    })
    fireEvent.change(screen.getByTestId('link-text-input'), {
      target: { value: 'Web' },
    })
    fireEvent.submit(screen.getByTestId('link-url-input'))
    expect(onInsert).toHaveBeenCalledWith('[Web](https://a.b)')
  })

  it('cancels', () => {
    const { onCancel } = renderModal()
    fireEvent.click(screen.getByTestId('link-modal-cancel'))
    expect(onCancel).toHaveBeenCalled()
  })
})
