import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminPage,
  StyledAdminPageHeader,
  StyledAdminPageHeading,
} from '../../../components/AdminPage/AdminPage.styles'
import {
  StyledAdminButtonGroup,
  StyledAdminDeleteButton,
  StyledAdminEditButton,
  StyledAdminEmpty,
  StyledAdminRefreshButton,
  StyledAdminRowActions,
  StyledAdminSearchInput,
  StyledAdminTable,
  StyledAdminTbody,
  StyledAdminTd,
  StyledAdminTh,
  StyledAdminThead,
  StyledAdminToolbar,
  StyledAdminTr,
} from '../../../components/AdminTable/AdminTable.styles'

export const StyledPage = styled(StyledAdminPage)``

export const StyledHeader = styled(StyledAdminPageHeader)``

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const StyledToolbar = styled(StyledAdminToolbar)``

export const StyledHeading = styled(StyledAdminPageHeading)``

export const StyledSearchInput = styled(StyledAdminSearchInput)``

export const StyledButtonGroup = styled(StyledAdminButtonGroup)``

export const StyledRefreshButton = styled(StyledAdminRefreshButton)``

export const StyledNewUserButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledTable = styled(StyledAdminTable)``

export const StyledThead = styled(StyledAdminThead)``

export const StyledTh = styled(StyledAdminTh)``

export const StyledTbody = styled(StyledAdminTbody)``

export const StyledTr = styled(StyledAdminTr)``

export const StyledTd = styled(StyledAdminTd)``

export const StyledRoleBadge = styled.span<{ $role: string }>`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $role, theme }) =>
    $role === 'user' ? theme.colors.white : theme.colors.black};
  background: ${({ $role, theme }) =>
    $role === 'admin'
      ? theme.colors.green
      : $role === 'editor'
        ? theme.colors.yellow
        : 'rgba(251,251,251,0.1)'};
`

export const StyledActions = styled(StyledAdminRowActions)``

export const StyledDeleteButton = styled(StyledAdminDeleteButton)``

export const StyledEditButton = styled(StyledAdminEditButton)``

export const StyledRoleSelectWrapper = styled.div`
  width: 90px;

  .select__control {
    padding: 0.1rem 0;
  }

  .select__single-value,
  .select__placeholder {
    font-size: 0.6rem;
  }

  .select__option {
    font-size: 0.65rem;
    padding: 0.3rem 0.5rem;
  }
`

export const StyledEmpty = styled(StyledAdminEmpty)``
