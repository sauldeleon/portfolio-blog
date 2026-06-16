import styled from 'styled-components'

import { Button } from '@sdlgr/button'

import {
  StyledAdminButtonGroup,
  StyledAdminDeleteButton,
  StyledAdminEmpty,
  StyledAdminRefreshButton,
  StyledAdminRowActions,
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
export const StyledButtonGroup = styled(StyledAdminButtonGroup)``
export const StyledRefreshButton = styled(StyledAdminRefreshButton)``
export const StyledTable = styled(StyledAdminTable)``
export const StyledThead = styled(StyledAdminThead)``
export const StyledTh = styled(StyledAdminTh)``
export const StyledTbody = styled(StyledAdminTbody)``
export const StyledTr = styled(StyledAdminTr)``
export const StyledTd = styled(StyledAdminTd)`
  vertical-align: top;
`
export const StyledActions = styled(StyledAdminRowActions)``
export const StyledDeleteButton = styled(StyledAdminDeleteButton)``
export const StyledEmpty = styled(StyledAdminEmpty)``

export const StyledStatusBadge = styled.span<{ $status: string }>`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border-radius: 2px;
  font-weight: 500;
  color: ${({ $status, theme }) =>
    $status === 'approved'
      ? theme.colors.green
      : $status === 'rejected'
        ? theme.colors.orange
        : theme.colors.yellow};
  background: ${({ $status, theme }) =>
    $status === 'approved'
      ? `${theme.colors.green}18`
      : $status === 'rejected'
        ? `${theme.colors.orange}18`
        : `${theme.colors.yellow}18`};
  border: 1px solid
    ${({ $status, theme }) =>
      $status === 'approved'
        ? `${theme.colors.green}40`
        : $status === 'rejected'
          ? `${theme.colors.orange}40`
          : `${theme.colors.yellow}40`};
`

export const StyledApproveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledRejectButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => `${theme.colors.orange}40`};
  opacity: 0.7;

  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.orange};
  }
`

export const StyledBodyText = styled.span<{ $expanded: boolean }>`
  display: block;
  max-width: 300px;
  line-height: 1.4;
  word-break: break-word;
  cursor: pointer;
  ${({ $expanded }) =>
    !$expanded
      ? `
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      `
      : `
        white-space: pre-wrap;
      `}
`

export const StyledExpandToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  padding: 0.15rem 0;
  display: block;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledFilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`

export const StyledFilterButton = styled.button<{ $active: boolean }>`
  background: none;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.green : 'rgba(251,251,251,0.15)'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  border-radius: 2px;
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};

  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
    color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCheckboxTh = styled.th`
  width: 2rem;
  padding: 0.75rem 0.5rem 0.75rem 0;
  vertical-align: middle;
`

export const StyledCheckboxTd = styled.td`
  width: 2rem;
  padding: 0.875rem 0.5rem 0.875rem 0;
  vertical-align: top;
`

export const StyledBulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const StyledBulkApproveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
  colorScheme: 'success',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledBulkRejectButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => `${theme.colors.orange}40`};

  &:hover {
    border-color: ${({ theme }) => theme.colors.orange};
    color: ${({ theme }) => theme.colors.orange};
  }
`

export const StyledBulkDeleteButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'sm',
  colorScheme: 'danger',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`
