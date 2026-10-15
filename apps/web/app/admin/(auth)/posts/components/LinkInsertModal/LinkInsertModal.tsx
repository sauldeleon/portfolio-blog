'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledHint,
  StyledInput,
  StyledInsertButton,
  StyledLabel,
  StyledLinkInsertModal,
  StyledModalContent,
  StyledPreview,
} from './LinkInsertModal.styles'

export interface LinkInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  /** Text selected in the editor, used as the link text. */
  initialText?: string
}

/**
 * A plain Markdown link. The blog opens external links in a new tab by itself
 * (see `PostContentLink`), so no HTML is needed.
 */
export function buildLinkMarkdown(text: string, url: string): string {
  const href = url
    .trim()
    .replace(/ /g, '%20')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
  const label = text.trim() || url.trim()
  return `[${label.replace(/([[\]\\])/g, '\\$1')}](${href})`
}

export function LinkInsertModal({
  isOpen,
  onInsert,
  onCancel,
  initialText = '',
}: LinkInsertModalProps) {
  const [text, setText] = useState(initialText)
  const [url, setUrl] = useState('')
  const preview = url.trim() ? buildLinkMarkdown(text, url) : null

  function handleInsert() {
    if (!preview) return
    onInsert(preview)
  }

  return (
    <StyledLinkInsertModal
      show={isOpen}
      onHide={onCancel}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="link-insert-modal"
    >
      <StyledModalContent
        as="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          handleInsert()
        }}
      >
        <StyledLabel htmlFor="link-url">URL</StyledLabel>
        <StyledInput
          id="link-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          autoFocus
          data-testid="link-url-input"
        />

        <StyledLabel htmlFor="link-text">Text</StyledLabel>
        <StyledInput
          id="link-text"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Defaults to the URL"
          data-testid="link-text-input"
        />

        <StyledHint>
          External links open in a new tab; links to the blog stay in it.
        </StyledHint>

        {preview && (
          <StyledPreview data-testid="link-preview">{preview}</StyledPreview>
        )}

        <StyledButtons>
          <StyledCancelButton
            type="button"
            onClick={onCancel}
            data-testid="link-modal-cancel"
          >
            Cancel
          </StyledCancelButton>
          <StyledInsertButton
            type="submit"
            disabled={!preview}
            data-testid="link-modal-insert"
          >
            Insert
          </StyledInsertButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledLinkInsertModal>
  )
}
