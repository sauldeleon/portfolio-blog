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

export const StyledCount = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
`
