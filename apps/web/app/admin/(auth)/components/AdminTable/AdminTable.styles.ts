import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledAdminToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  flex-wrap: wrap;
`

export const StyledAdminSearchInput = styled(Input)`
  font-size: 0.75rem;
  width: 220px;
  padding: 0.375rem 0;
`

export const StyledAdminButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledAdminRefreshButton = styled(Button).attrs({
  colorScheme: 'success',
})`
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover {
    opacity: 0.6;
  }
`

export const StyledAdminTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

export const StyledAdminThead = styled.thead`
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledAdminTh = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  font-weight: 400;
  white-space: nowrap;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    text-align: right;
  }
`

export const StyledAdminTbody = styled.tbody``

export const StyledAdminTr = styled.tr`
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);

  &:last-child {
    border-bottom: none;
  }
`

export const StyledAdminTd = styled.td`
  padding: 0.875rem 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  vertical-align: middle;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
`

export const StyledAdminRowActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`

export const StyledAdminEditButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledAdminSaveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledAdminCancelButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: ${({ theme }) => theme.colors.white};
  border-color: rgba(251, 251, 251, 0.3);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    border-color: ${({ theme }) => theme.colors.white};
    opacity: 1;
  }
`

export const StyledAdminDeleteButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'danger',
})`
  font-family: inherit;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover:not(:disabled) {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
  }
`

export const StyledAdminEmpty = styled.div`
  padding: 4rem 0;
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.3;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`

export const StyledAdminLocaleTabs = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.375rem;
`

export const StyledAdminLocaleTab = styled(Button).attrs({ variant: 'label' })`
  min-height: unset;
  padding: 0.1rem 0.4rem;
  font-size: 0.55rem;
  border-color: ${({ active, theme }) =>
    active ? theme.colors.green : 'rgba(251,251,251,0.2)'};
  color: ${({ active, theme }) =>
    active ? theme.colors.green : theme.colors.white};
  opacity: ${({ active }) => (active ? 1 : 0.4)};

  &:hover {
    border-color: ${({ active, theme }) =>
      active ? theme.colors.green : 'rgba(251,251,251,0.4)'};
    opacity: 1;
    color: ${({ active, theme }) =>
      active ? theme.colors.green : theme.colors.white};
  }
`
