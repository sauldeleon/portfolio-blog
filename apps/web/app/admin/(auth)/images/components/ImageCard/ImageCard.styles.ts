import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(251, 251, 251, 0.03);
  border: 1px solid rgba(251, 251, 251, 0.08);
  border-radius: 2px;
  overflow: hidden;
`

export const StyledImageWrapper = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.3);

  img {
    width: 100% !important;
    height: auto !important;
    display: block;
    position: relative !important;
  }
`

export const StyledInfo = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const StyledFilename = styled.p`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const StyledMeta = styled.p`
  font-size: 0.55rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0;
`

export const StyledActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(251, 251, 251, 0.06);
`

const actionButtonBase = `
  font-family: inherit;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.5rem;
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledCopyButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
`

export const StyledEditButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
`

export const StyledDeleteButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => theme.colors.orange};
`
