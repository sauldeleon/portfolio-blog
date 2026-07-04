import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledCanyonSummaryWrapper = styled.div`
  margin: 2rem 0;
`

export const StyledDownloadBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.35rem 0;
`

export const StyledDownloadButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  display: inline-flex;
  gap: 0.35rem;
  border-color: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  opacity: 0.7;
  color: inherit;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: rgba(128, 128, 128, 0.6);
  }
`

export const StyledDownloadError = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.orange};
  font-size: 0.8rem;
  text-align: right;
`
