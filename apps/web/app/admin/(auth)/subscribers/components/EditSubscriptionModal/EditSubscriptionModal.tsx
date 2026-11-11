'use client'

import { RenderModalBackdropProps } from 'react-overlays/Modal'

import { SubscriptionDetailsForm } from '@web/components/SubscriptionDetailsForm'
import { useClientTranslation } from '@web/i18n/client'
import type { AdminSubscriptionRecord } from '@web/lib/db/queries/subscriptions'
import type { SubscriptionDetails } from '@web/lib/subscriptions/schema'

import {
  StyledBackdrop,
  StyledBody,
  StyledEmail,
  StyledModal,
  StyledTitle,
} from './EditSubscriptionModal.styles'

export interface EditSubscriptionModalProps {
  subscription: AdminSubscriptionRecord
  onSave: (values: SubscriptionDetails) => Promise<void>
  onClose: () => void
}

export function EditSubscriptionModal({
  subscription,
  onSave,
  onClose,
}: EditSubscriptionModalProps) {
  const { t } = useClientTranslation('admin')

  return (
    <StyledModal
      show
      onHide={onClose}
      renderBackdrop={(props: RenderModalBackdropProps) => (
        <StyledBackdrop {...props} />
      )}
      aria-labelledby="edit-subscription-title"
      data-testid="edit-subscription-modal"
    >
      <StyledBody>
        <StyledTitle id="edit-subscription-title">
          {t('subscribers.editTitle')}
        </StyledTitle>
        <StyledEmail>{subscription.email}</StyledEmail>
        <SubscriptionDetailsForm
          idPrefix="edit-subscription"
          defaultValues={{
            name: subscription.name,
            locale: subscription.locale,
          }}
          labels={{
            name: t('subscribers.form.name'),
            locale: t('subscribers.form.locale'),
            localeOptions: {
              en: t('subscribers.form.localeOptions.en'),
              es: t('subscribers.form.localeOptions.es'),
            },
            submit: t('subscribers.form.save'),
            submitting: t('subscribers.form.saving'),
            success: t('subscribers.form.success'),
            error: t('subscribers.form.error'),
            cancel: t('subscribers.form.cancel'),
          }}
          onSubmit={onSave}
          onCancel={onClose}
          variant="admin"
        />
      </StyledBody>
    </StyledModal>
  )
}
