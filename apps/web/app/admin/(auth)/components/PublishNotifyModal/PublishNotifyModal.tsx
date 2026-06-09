'use client'

import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledBackdrop,
  StyledButtons,
  StyledCancelButton,
  StyledMessage,
  StyledModal,
  StyledModalContent,
  StyledPublishAndNotifyButton,
  StyledPublishOnlyButton,
} from './PublishNotifyModal.styles'

export interface PublishNotifyModalProps {
  isOpen: boolean
  onPublishAndNotify: () => void
  onPublishOnly: () => void
  onCancel: () => void
}

export function PublishNotifyModal({
  isOpen,
  onPublishAndNotify,
  onPublishOnly,
  onCancel,
}: PublishNotifyModalProps) {
  const { t } = useClientTranslation('admin')

  return (
    <StyledModal
      show={isOpen}
      onHide={onCancel}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="publish-notify-modal"
    >
      <StyledModalContent>
        <StyledMessage>{t('publishNotify.message')}</StyledMessage>
        <StyledButtons>
          <StyledCancelButton
            onClick={onCancel}
            data-testid="publish-notify-cancel"
          >
            {t('publishNotify.cancel')}
          </StyledCancelButton>
          <StyledPublishOnlyButton
            onClick={onPublishOnly}
            data-testid="publish-notify-publish-only"
          >
            {t('publishNotify.publishOnly')}
          </StyledPublishOnlyButton>
          <StyledPublishAndNotifyButton
            onClick={onPublishAndNotify}
            data-testid="publish-notify-publish-and-notify"
          >
            {t('publishNotify.publishAndNotify')}
          </StyledPublishAndNotifyButton>
        </StyledButtons>
      </StyledModalContent>
    </StyledModal>
  )
}

export default PublishNotifyModal
