'use client'

import type { AdminSubscriptionRecord } from '@web/lib/db/queries/subscriptions'

import { SubscribersTable } from '../SubscribersTable'
import {
  StyledHeader,
  StyledHeading,
  StyledPage,
} from './SubscribersPageView.styles'

interface SubscribersPageViewProps {
  initialSubscriptions: AdminSubscriptionRecord[]
  title: string
}

export function SubscribersPageView({
  initialSubscriptions,
  title,
}: SubscribersPageViewProps) {
  return (
    <StyledPage data-testid="admin-subscribers-page">
      <StyledHeader>
        <StyledHeading>{title}</StyledHeading>
      </StyledHeader>
      <SubscribersTable initialSubscriptions={initialSubscriptions} />
    </StyledPage>
  )
}
