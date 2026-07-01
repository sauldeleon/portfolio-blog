import styled from 'styled-components'

import { Textarea } from '@sdlgr/input'

export const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledLangToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledSectionTitle = styled.h3`
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0;
`

export const StyledFieldRow = styled.div`
  display: flex;
  gap: 0.75rem;

  > * {
    flex: 1;
  }
`

export const StyledGpxRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;

  > *:first-child {
    flex: 1;
  }
`

export const StyledTextarea = styled(Textarea)`
  font-size: 0.8125rem;
  font-family: monospace;
  min-height: 260px;
  resize: vertical;
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledPreviewStack = styled.div`
  display: flex;
  flex-direction: column;
`

export const StyledBulkBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

export const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`
