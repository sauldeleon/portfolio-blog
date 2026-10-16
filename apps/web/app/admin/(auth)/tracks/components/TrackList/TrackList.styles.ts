import Link from 'next/link'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import { StyledAdminError } from '../../../components/AdminForm/AdminForm.styles'
import {
  StyledAdminPage,
  StyledAdminPageHeader,
  StyledAdminPageHeading,
} from '../../../components/AdminPage/AdminPage.styles'
import {
  StyledAdminButtonGroup,
  StyledAdminEmpty,
  StyledAdminRefreshButton,
  StyledAdminSearchInput,
  StyledAdminToolbar,
} from '../../../components/AdminTable/AdminTable.styles'

export const StyledWrapper = styled(StyledAdminPage)``

export const StyledHeader = styled(StyledAdminPageHeader)``

export const StyledTitle = styled(StyledAdminPageHeading)``

export const StyledToolbar = styled(StyledAdminToolbar)``

export const StyledSearchInput = styled(StyledAdminSearchInput)``

export const StyledActions = styled(StyledAdminButtonGroup)``

export const StyledRefreshButton = styled(StyledAdminRefreshButton)``

export const StyledUploadButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledEmptyState = styled(StyledAdminEmpty)``

export const StyledError = styled(StyledAdminError)``

export const StyledNotice = styled.p`
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.green};
`

/*
 * One grid shared by every row (rows use subgrid), so the name, the original
 * and the clean versions line up in columns whatever their content:
 * name | original: link, size, copy | clean: link, size, copy
 */
export const StyledList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) repeat(2, auto auto auto);
  column-gap: 0.75rem;

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
  }
`

export const StyledRow = styled.li`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};

  @media (max-width: 720px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`

export const StyledName = styled.span`
  overflow-wrap: anywhere;
  padding-right: 0.75rem;
`

export const StyledVersion = styled.span<{ $slot: 'original' | 'clean' }>`
  grid-column: ${({ $slot }) => ($slot === 'original' ? '2' : '5')} / span 3;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  font-size: 0.7rem;
  opacity: 0.85;

  > span {
    justify-self: end;
    font-variant-numeric: tabular-nums;
  }

  ${({ $slot }) => $slot === 'clean' && 'padding-left: 1.5rem;'}

  @media (max-width: 720px) {
    display: inline-flex;
    gap: 0.75rem;
    padding-left: 0;
  }
`

export const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledCount = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
`
