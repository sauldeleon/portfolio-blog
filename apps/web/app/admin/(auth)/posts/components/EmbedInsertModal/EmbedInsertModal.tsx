'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import type { ParsedEmbed } from '../PostEditor/parseEmbedBlock'
import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledEmbedInsertModal,
  StyledInput,
  StyledInsertButton,
  StyledLabel,
  StyledModalContent,
  StyledPreview,
  StyledSegmentButton,
  StyledSegmentRow,
} from './EmbedInsertModal.styles'

export interface EmbedInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  initialValues?: ParsedEmbed | null
}

type EmbedType = 'youtube' | 'maps' | 'openstreetmap' | 'wikiloc'

const EMBED_TYPES: EmbedType[] = ['youtube', 'maps', 'openstreetmap', 'wikiloc']

const LABELS: Record<EmbedType, string> = {
  youtube: 'YouTube',
  maps: 'Google Maps',
  openstreetmap: 'OpenStreetMap',
  wikiloc: 'Wikiloc',
}

const PLACEHOLDERS: Record<EmbedType, string> = {
  youtube: 'https://www.youtube.com/embed/<video-id>',
  maps: 'https://www.google.com/maps/embed?pb=...',
  openstreetmap: 'https://www.openstreetmap.org/export/embed.html?...',
  wikiloc:
    'https://www.wikiloc.com/wikiloc/embedv2.do?id=<trail-id>&elevation=on&images=on&maptype=H',
}

export function buildEmbedMarkdown(type: EmbedType, url: string): string {
  return `\n\n\`\`\`${type}\n${url.trim()}\n\`\`\`\n\n`
}

export function EmbedInsertModal({
  isOpen,
  onInsert,
  onCancel,
  initialValues,
}: EmbedInsertModalProps) {
  const [embedType, setEmbedType] = useState<EmbedType>(
    initialValues?.type ?? 'youtube',
  )
  const [url, setUrl] = useState(initialValues?.url ?? '')

  function handleInsert() {
    /* istanbul ignore next */
    if (!url.trim()) return
    onInsert(buildEmbedMarkdown(embedType, url))
    setEmbedType('youtube')
    setUrl('')
  }

  const preview = url.trim() ? buildEmbedMarkdown(embedType, url).trim() : null

  return (
    <StyledEmbedInsertModal
      show={isOpen}
      onHide={onCancel}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="embed-insert-modal"
    >
      <StyledModalContent>
        <StyledLabel>Type</StyledLabel>
        <StyledSegmentRow>
          {EMBED_TYPES.map((type) => (
            <StyledSegmentButton
              key={type}
              type="button"
              $active={embedType === type}
              onClick={() => setEmbedType(type)}
              data-testid={`embed-type-${type}`}
            >
              {LABELS[type]}
            </StyledSegmentButton>
          ))}
        </StyledSegmentRow>

        <StyledLabel htmlFor="embed-url">URL</StyledLabel>
        <StyledInput
          id="embed-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={PLACEHOLDERS[embedType]}
          data-testid="embed-url-input"
        />

        {preview && (
          <StyledPreview data-testid="embed-preview">{preview}</StyledPreview>
        )}

        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="embed-modal-cancel"
          >
            Cancel
          </StyledCancelButton>
          <StyledInsertButton
            onClick={handleInsert}
            disabled={!url.trim()}
            data-testid="embed-modal-insert"
          >
            Insert
          </StyledInsertButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledEmbedInsertModal>
  )
}
