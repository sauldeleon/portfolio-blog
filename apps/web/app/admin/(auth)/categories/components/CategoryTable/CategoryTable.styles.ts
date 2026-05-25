import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

import {
  StyledAdminButtonGroup,
  StyledAdminCancelButton,
  StyledAdminDeleteButton,
  StyledAdminEditButton,
  StyledAdminEmpty,
  StyledAdminLocaleTab,
  StyledAdminLocaleTabs,
  StyledAdminRefreshButton,
  StyledAdminRowActions,
  StyledAdminSaveButton,
  StyledAdminSearchInput,
  StyledAdminTable,
  StyledAdminTbody,
  StyledAdminTd,
  StyledAdminTh,
  StyledAdminThead,
  StyledAdminToolbar,
  StyledAdminTr,
} from '../../../components/AdminTable/AdminTable.styles'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const StyledToolbar = styled(StyledAdminToolbar)``

export const StyledSearchInput = styled(StyledAdminSearchInput)``

export const StyledNewButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledRefreshButton = styled(StyledAdminRefreshButton)``

export const StyledButtonGroup = styled(StyledAdminButtonGroup)``

export const StyledTable = styled(StyledAdminTable)``

export const StyledThead = styled(StyledAdminThead)``

export const StyledTh = styled(StyledAdminTh)``

export const StyledTbody = styled(StyledAdminTbody)``

export const StyledTr = styled(StyledAdminTr)``

export const StyledTd = styled(StyledAdminTd)``

export const StyledName = styled.span`
  font-size: 0.8rem;
  opacity: 0.9;
`

export const StyledSlug = styled.span`
  font-size: 0.7rem;
  opacity: 0.4;
`

export const StyledPostCount = styled.span`
  font-size: 0.75rem;
  opacity: 0.6;
`

export const StyledEditInput = styled(Input)`
  border-bottom-color: ${({ theme }) => theme.colors.green};
  padding: 0.25rem 0;
  font-size: 0.8rem;
  width: 100%;
`

export const StyledActions = styled(StyledAdminRowActions)``

export const StyledEditButton = styled(StyledAdminEditButton)``

export const StyledSaveButton = styled(StyledAdminSaveButton)``

export const StyledCancelButton = styled(StyledAdminCancelButton)``

export const StyledDeleteButton = styled(StyledAdminDeleteButton)``

export const StyledEmpty = styled(StyledAdminEmpty)``

export const StyledLocaleTabs = styled(StyledAdminLocaleTabs)``

export const StyledLocaleTab = styled(StyledAdminLocaleTab)``
