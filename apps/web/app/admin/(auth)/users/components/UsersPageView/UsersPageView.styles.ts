import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`

export const StyledHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
`

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
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

export const StyledHeading = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledSearchInput = styled(Input)`
  font-size: 0.75rem;
  width: 220px;
  padding: 0.375rem 0;
`

export const StyledButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledRefreshButton = styled(Button).attrs({
  colorScheme: 'success',
})`
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover {
    opacity: 0.6;
  }
`

export const StyledNewUserButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`

export const StyledThead = styled.thead`
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledTh = styled.th`
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

export const StyledTbody = styled.tbody``

export const StyledTr = styled.tr`
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);

  &:last-child {
    border-bottom: none;
  }
`

export const StyledTd = styled.td`
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

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`

export const StyledDeleteButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'danger',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledEditButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

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

export const StyledEmpty = styled.div`
  padding: 4rem 0;
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.3;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`
