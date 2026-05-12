import styled from 'styled-components'

import type { CalloutType } from './Callout'

const borderColors: Record<CalloutType, string> = {
  note: '#00235B',
  warning: '#B04B2F',
  tip: '#98DFD6',
}

export const StyledCallout = styled.div<{ $type: CalloutType }>`
  border-left: 4px solid ${({ $type }) => borderColors[$type]};
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
`
