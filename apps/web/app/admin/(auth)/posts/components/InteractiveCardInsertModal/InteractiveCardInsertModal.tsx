'use client'

import { useState } from 'react'
import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { Button } from '@sdlgr/button'

import {
  serializeCanyonSummary,
  serializeCroquisMeta,
  serializeFerrataSummary,
} from '@web/lib/cards'
import type {
  CanyoningCardData,
  Lang,
  SummaryFerrataData,
} from '@web/lib/cards'

import { CanyoningForm } from '../../../cards/components/CanyoningForm'
import { StyledLangToggle } from '../../../cards/components/CanyoningForm/CanyoningForm.styles'
import { FerrataForm } from '../../../cards/components/FerrataForm'
import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledCroquisModal,
  StyledInsertButton,
  StyledModalContent,
  StyledSectionLabel,
  StyledTextarea,
} from '../CroquisInsertModal/CroquisInsertModal.styles'
import { StyledCheckboxRow } from '../GpxMapModal/GpxMapModal.styles'
import type { ParsedInteractiveCard } from '../PostEditor/parseEmbedBlock'

type CardType = 'canyon' | 'ferrata'

export interface InteractiveCardInsertModalProps {
  isOpen: boolean
  onInsert: (markdown: string) => void
  onCancel: () => void
  /** The post's current editing locale; fixes the card language. */
  lang: Lang
  initialValues?: ParsedInteractiveCard | null
}

/**
 * Builds an interactive summary card block for the post. The author picks the
 * card type (canyon or via ferrata), which swaps in the matching form; the card
 * language comes from the post's current editing locale, not the modal. A
 * read-only preview shows the exact fenced block that will be inserted.
 */
export function InteractiveCardInsertModal({
  isOpen,
  onInsert,
  onCancel,
  lang,
  initialValues,
}: InteractiveCardInsertModalProps) {
  const initialType: CardType =
    initialValues?.data.kind === 'summary-ferrata' ? 'ferrata' : 'canyon'
  const [type, setType] = useState<CardType>(initialType)
  const [canyonData, setCanyonData] = useState<CanyoningCardData>(
    initialValues?.data.kind === 'canyoning-data'
      ? { ...initialValues.data, lang }
      : { kind: 'canyoning-data', lang },
  )
  const [ferrataData, setFerrataData] = useState<SummaryFerrataData>(
    initialValues?.data.kind === 'summary-ferrata'
      ? { ...initialValues.data, lang }
      : { kind: 'summary-ferrata', lang },
  )
  const [showDownload, setShowDownload] = useState(
    initialValues?.showDownload ?? true,
  )

  // The exact fenced block that will be inserted; only the download flag rides
  // in the meta, the rest lives in the JSON body.
  const meta = serializeCroquisMeta({ title: '', showDownload })
  const fence = type === 'canyon' ? 'canyon-summary' : 'ferrata-summary'
  const body =
    type === 'canyon'
      ? serializeCanyonSummary(canyonData)
      : serializeFerrataSummary(ferrataData)
  const preview = `\`\`\`${fence}${meta ? ` ${meta}` : ''}\n${body}\n\`\`\``

  function handleInsert() {
    onInsert(`\n\n${preview}\n\n`)
    setCanyonData({ kind: 'canyoning-data', lang })
    setFerrataData({ kind: 'summary-ferrata', lang })
    setShowDownload(true)
  }

  return (
    <StyledCroquisModal
      show={isOpen}
      onHide={onCancel}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="interactive-card-insert-modal"
    >
      <StyledModalContent data-testid="interactive-card-modal">
        <StyledSectionLabel>Card type</StyledSectionLabel>
        <StyledLangToggle>
          <Button
            type="button"
            variant="label"
            active={type === 'canyon'}
            onClick={() => setType('canyon')}
            data-testid="interactive-card-type-canyon"
          >
            Canyon
          </Button>
          <Button
            type="button"
            variant="label"
            active={type === 'ferrata'}
            onClick={() => setType('ferrata')}
            data-testid="interactive-card-type-ferrata"
          >
            Via Ferrata
          </Button>
        </StyledLangToggle>

        {type === 'canyon' ? (
          <CanyoningForm value={canyonData} onChange={setCanyonData} hideLang />
        ) : (
          <FerrataForm value={ferrataData} onChange={setFerrataData} hideLang />
        )}

        <StyledCheckboxRow>
          <label>
            <input
              type="checkbox"
              checked={showDownload}
              onChange={(e) => setShowDownload(e.target.checked)}
              data-testid="interactive-card-modal-download-toggle"
            />
            Show PNG download button
          </label>
        </StyledCheckboxRow>

        <StyledSectionLabel>Preview</StyledSectionLabel>
        <StyledTextarea
          readOnly
          value={preview}
          data-testid="interactive-card-modal-preview"
        />

        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="interactive-card-modal-cancel"
          >
            Cancel
          </StyledCancelButton>
          <StyledInsertButton
            onClick={handleInsert}
            data-testid="interactive-card-modal-insert"
          >
            Insert
          </StyledInsertButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledCroquisModal>
  )
}
