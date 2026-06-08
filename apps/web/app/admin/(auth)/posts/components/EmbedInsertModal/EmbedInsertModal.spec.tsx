import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { EmbedInsertModal, buildEmbedMarkdown } from './EmbedInsertModal'

describe('EmbedInsertModal', () => {
  it('renders nothing when closed', () => {
    renderApp(
      <EmbedInsertModal
        isOpen={false}
        onInsert={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.queryByTestId('embed-url-input')).not.toBeInTheDocument()
  })

  it('renders modal content when open', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(screen.getByTestId('embed-type-youtube')).toBeInTheDocument()
    expect(screen.getByTestId('embed-type-maps')).toBeInTheDocument()
    expect(screen.getByTestId('embed-type-openstreetmap')).toBeInTheDocument()
    expect(screen.getByTestId('embed-type-wikiloc')).toBeInTheDocument()
    expect(screen.getByTestId('embed-url-input')).toBeInTheDocument()
    expect(screen.getByTestId('embed-modal-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('embed-modal-insert')).toBeInTheDocument()
  })

  it('defaults to youtube type', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(screen.getByTestId('embed-url-input')).toHaveAttribute(
      'placeholder',
      'https://www.youtube.com/embed/<video-id>',
    )
  })

  it('insert button is disabled when url is empty', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(screen.getByTestId('embed-modal-insert')).toBeDisabled()
  })

  it('insert button enabled when url is filled', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://www.youtube.com/embed/abc' },
    })
    expect(screen.getByTestId('embed-modal-insert')).not.toBeDisabled()
  })

  it('shows preview when url is filled', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://www.youtube.com/embed/abc' },
    })
    expect(screen.getByTestId('embed-preview')).toBeInTheDocument()
    expect(screen.getByTestId('embed-preview').textContent).toBe(
      '```youtube\nhttps://www.youtube.com/embed/abc\n```',
    )
  })

  it('does not show preview when url is empty', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    expect(screen.queryByTestId('embed-preview')).not.toBeInTheDocument()
  })

  it('changes placeholder when type changes to maps', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-maps'))
    expect(screen.getByTestId('embed-url-input')).toHaveAttribute(
      'placeholder',
      'https://www.google.com/maps/embed?pb=...',
    )
  })

  it('changes placeholder when type changes to openstreetmap', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-openstreetmap'))
    expect(screen.getByTestId('embed-url-input')).toHaveAttribute(
      'placeholder',
      'https://www.openstreetmap.org/export/embed.html?...',
    )
  })

  it('changes placeholder when type changes to wikiloc', () => {
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-wikiloc'))
    expect(screen.getByTestId('embed-url-input')).toHaveAttribute(
      'placeholder',
      'https://www.wikiloc.com/wikiloc/embedv2.do?id=<trail-id>&elevation=on&images=on&maptype=H',
    )
  })

  it('inserts youtube markdown', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://www.youtube.com/embed/abc123' },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```youtube\nhttps://www.youtube.com/embed/abc123\n```\n\n',
    )
  })

  it('inserts maps markdown', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-maps'))
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://www.google.com/maps/embed?pb=123' },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```maps\nhttps://www.google.com/maps/embed?pb=123\n```\n\n',
    )
  })

  it('inserts openstreetmap markdown', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-openstreetmap'))
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: {
        value: 'https://www.openstreetmap.org/export/embed.html?bbox=0',
      },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```openstreetmap\nhttps://www.openstreetmap.org/export/embed.html?bbox=0\n```\n\n',
    )
  })

  it('inserts wikiloc markdown', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-wikiloc'))
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://www.wikiloc.com/wikiloc/embedv2.do?id=123' },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```wikiloc\nhttps://www.wikiloc.com/wikiloc/embedv2.do?id=123\n```\n\n',
    )
  })

  it('trims whitespace from url on insert', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: '  https://www.youtube.com/embed/abc  ' },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(onInsert).toHaveBeenCalledWith(
      '\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\n',
    )
  })

  it('calls onCancel when cancel clicked', () => {
    const onCancel = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={jest.fn()} onCancel={onCancel} />,
    )
    fireEvent.click(screen.getByTestId('embed-modal-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('resets state after insert', () => {
    const onInsert = jest.fn()
    renderApp(
      <EmbedInsertModal isOpen onInsert={onInsert} onCancel={jest.fn()} />,
    )
    fireEvent.click(screen.getByTestId('embed-type-maps'))
    fireEvent.change(screen.getByTestId('embed-url-input'), {
      target: { value: 'https://maps.example.com' },
    })
    fireEvent.click(screen.getByTestId('embed-modal-insert'))
    expect(screen.getByTestId('embed-url-input')).toHaveValue('')
    expect(screen.queryByTestId('embed-preview')).not.toBeInTheDocument()
    expect(screen.getByTestId('embed-url-input')).toHaveAttribute(
      'placeholder',
      'https://www.youtube.com/embed/<video-id>',
    )
  })
})

describe('buildEmbedMarkdown', () => {
  it('builds youtube markdown', () => {
    expect(
      buildEmbedMarkdown('youtube', 'https://www.youtube.com/embed/abc'),
    ).toBe('\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\n')
  })

  it('builds maps markdown', () => {
    expect(
      buildEmbedMarkdown('maps', 'https://www.google.com/maps/embed?pb=123'),
    ).toBe('\n\n```maps\nhttps://www.google.com/maps/embed?pb=123\n```\n\n')
  })

  it('builds openstreetmap markdown', () => {
    expect(
      buildEmbedMarkdown(
        'openstreetmap',
        'https://www.openstreetmap.org/export/embed.html?bbox=0',
      ),
    ).toBe(
      '\n\n```openstreetmap\nhttps://www.openstreetmap.org/export/embed.html?bbox=0\n```\n\n',
    )
  })

  it('builds wikiloc markdown', () => {
    expect(
      buildEmbedMarkdown(
        'wikiloc',
        'https://www.wikiloc.com/wikiloc/embedv2.do?id=123',
      ),
    ).toBe(
      '\n\n```wikiloc\nhttps://www.wikiloc.com/wikiloc/embedv2.do?id=123\n```\n\n',
    )
  })

  it('trims whitespace from url', () => {
    expect(
      buildEmbedMarkdown('youtube', '  https://www.youtube.com/embed/abc  '),
    ).toBe('\n\n```youtube\nhttps://www.youtube.com/embed/abc\n```\n\n')
  })
})
