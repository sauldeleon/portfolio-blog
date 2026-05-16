import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
`

export const StyledHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
`

export const StyledTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledUploadButton = styled(Button)`
  text-transform: uppercase;
`

export const StyledRefreshButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};

  &:hover {
    opacity: 0.6;
  }
`

export const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  align-items: start;
`

export const StyledEmptyState = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0;
  text-align: center;
  padding: 3rem 0;
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledLoading = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0;
  text-align: center;
  padding: 3rem 0;
`
