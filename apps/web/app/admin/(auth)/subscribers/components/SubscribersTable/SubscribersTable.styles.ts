import styled from 'styled-components'

import {
  StyledAdminButtonGroup,
  StyledAdminEditButton,
  StyledAdminEmpty,
  StyledAdminRefreshButton,
  StyledAdminRowActions,
  StyledAdminSearchInput,
  StyledAdminStatusBadge,
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
`

export const StyledToolbar = styled(StyledAdminToolbar)``
export const StyledButtonGroup = styled(StyledAdminButtonGroup)``
export const StyledSearchGroup = styled(StyledAdminButtonGroup)`
  gap: 1.5rem;
`
export const StyledSearchInput = styled(StyledAdminSearchInput)``
export const StyledRefreshButton = styled(StyledAdminRefreshButton)``
export const StyledTable = styled(StyledAdminTable)``
export const StyledThead = styled(StyledAdminThead)``
export const StyledTh = styled(StyledAdminTh)``
export const StyledTbody = styled(StyledAdminTbody)``
export const StyledTr = styled(StyledAdminTr)<{ $disabled: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`
export const StyledTd = styled(StyledAdminTd)``
export const StyledEmpty = styled(StyledAdminEmpty)``
export const StyledEditButton = styled(StyledAdminEditButton)``

export const StyledCount = styled.span`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
`

export const StyledStatusBadge = styled(StyledAdminStatusBadge)``

export const StyledToggleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.7rem;

  &:has(input:disabled) {
    cursor: not-allowed;
  }
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledActions = styled(StyledAdminRowActions)``
