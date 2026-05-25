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

export const StyledRefreshButton = styled(StyledAdminRefreshButton)``

export const StyledButtonGroup = styled(StyledAdminButtonGroup)``

export const StyledTable = styled(StyledAdminTable)``

export const StyledThead = styled(StyledAdminThead)``

export const StyledTh = styled(StyledAdminTh)``

export const StyledTbody = styled(StyledAdminTbody)``

export const StyledTr = styled(StyledAdminTr)``

export const StyledTd = styled(StyledAdminTd)``

export const StyledSeriesId = styled.span`
  font-size: 0.7rem;
  opacity: 0.4;
  font-family: monospace;
`

export const StyledTitle = styled.span`
  font-size: 0.8rem;
  opacity: 0.9;
`

export const StyledPostCount = styled.span<{ $clickable?: boolean }>`
  font-size: 0.75rem;
  opacity: 0.6;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  user-select: none;

  &:hover {
    opacity: ${({ $clickable }) => ($clickable ? 1 : 0.6)};
  }
`

export const StyledExpandedRow = styled.tr`
  background: rgba(251, 251, 251, 0.02);
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);
`

export const StyledExpandedCell = styled.td`
  padding: 0.25rem 1rem 0.75rem 0;
`

export const StyledPostsList = styled.div`
  font-size: 0.65rem;
  opacity: 0.7;
`

export const StyledPostItem = styled.tr``

export const StyledPostOrder = styled.td`
  font-family: monospace;
  opacity: 0.5;
  min-width: 1.25rem;
  text-align: right;
  font-size: 0.65rem;
  padding: 0.3rem 0.75rem 0.3rem 0;
  white-space: nowrap;
`

export const StyledPostTitle = styled.td`
  font-size: 0.65rem;
  width: 100%;
  padding: 0.3rem 0.75rem 0.3rem 0;
`

export const StyledPostDate = styled.td`
  font-size: 0.6rem;
  opacity: 0.4;
  white-space: nowrap;
  padding: 0.3rem 0.75rem 0.3rem 0;
`

export const StyledPostActions = styled.td`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0 0.3rem 0;
  white-space: nowrap;
  width: 1%;
`

export const StyledInnerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
`

export const StyledInnerThead = styled.thead`
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);
`

export const StyledInnerTh = styled.th`
  padding: 0.25rem 0.75rem 0.25rem 0;
  text-align: left;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.3;
  font-weight: 400;
  white-space: nowrap;

  &:last-child {
    padding-right: 0;
    text-align: right;
  }
`

export const StyledInnerTbody = styled.tbody``

export const StyledInnerTr = styled.tr`
  border-bottom: 1px solid rgba(251, 251, 251, 0.03);

  &:last-child {
    border-bottom: none;
  }
`

export const StyledViewPostButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  font-size: 0.55rem;
  padding: 0.1rem 0.4rem;
  min-height: unset;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledRemoveFromSeriesButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'danger',
})`
  font-size: 0.55rem;
  padding: 0.1rem 0.4rem;
  min-height: unset;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
  }
`

export const StyledEditInput = styled(Input)`
  border-bottom-color: ${({ theme }) => theme.colors.green};
  padding: 0.25rem 0;
  font-size: 0.8rem;
  width: 100%;
`

export const StyledActions = styled(StyledAdminRowActions)``

export const StyledNewButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledEditButton = styled(StyledAdminEditButton)``

export const StyledSaveButton = styled(StyledAdminSaveButton)``

export const StyledCancelButton = styled(StyledAdminCancelButton)``

export const StyledDeleteButton = styled(StyledAdminDeleteButton)``

export const StyledEmpty = styled(StyledAdminEmpty)``

export const StyledLocaleTabs = styled(StyledAdminLocaleTabs)``

export const StyledLocaleTab = styled(StyledAdminLocaleTab)``
