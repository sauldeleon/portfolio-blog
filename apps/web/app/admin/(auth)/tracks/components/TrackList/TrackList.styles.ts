import Link from 'next/link'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
`

export const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

export const StyledTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  flex-wrap: wrap;
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  > button {
    text-transform: uppercase;
  }
`

export const StyledSearchInput = styled(Input)`
  font-size: 0.75rem;
  width: 260px;
  padding: 0.375rem 0;
`

export const StyledNotice = styled.p`
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.green};
`

export const StyledRefreshButton = styled(Button).attrs({
  colorScheme: 'success',
})`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`

export const StyledRow = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`

export const StyledName = styled.span`
  overflow-wrap: anywhere;
`

export const StyledVersion = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.7rem;
  opacity: 0.85;
`

export const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

export const StyledCount = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
`
