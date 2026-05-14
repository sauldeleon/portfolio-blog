import React from 'react'

import { StyledCallout } from './Callout.styles'

export type CalloutType = 'note' | 'warning' | 'tip'

export interface CalloutProps {
  type: CalloutType
  children: React.ReactNode
}

export function Callout({ type, children }: CalloutProps) {
  return (
    <StyledCallout data-testid="callout" data-type={type} $type={type}>
      {children}
    </StyledCallout>
  )
}
