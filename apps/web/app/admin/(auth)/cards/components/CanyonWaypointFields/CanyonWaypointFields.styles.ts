import styled from 'styled-components'

import { Textarea } from '@sdlgr/input'

export const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledSectionTitle = styled.h4`
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.35;
  margin: 0;
`

export const StyledFieldRow = styled.div`
  display: flex;
  gap: 0.75rem;

  > * {
    flex: 1;
  }
`

export const StyledNotes = styled(Textarea)`
  font-size: 0.8125rem;
  font-family: monospace;
  min-height: 120px;
  resize: vertical;
`
