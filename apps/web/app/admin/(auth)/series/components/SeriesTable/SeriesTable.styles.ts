import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledWrapper = styled.div`
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

export const StyledSearchInput = styled(Input)`
  font-size: 0.75rem;
  width: 220px;
  padding: 0.375rem 0;
`

export const StyledRefreshButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};

  &:hover {
    opacity: 0.6;
  }
`

export const StyledButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
})`
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
  font-size: 0.55rem;
  padding: 0.1rem 0.4rem;
  min-height: unset;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledRemoveFromSeriesButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => theme.colors.orange};
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

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`

export const StyledNewButton = styled(Button)`
  text-transform: uppercase;
  letter-spacing: 0.1em;
`

export const StyledEditButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledSaveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledCancelButton = styled(Button).attrs({
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

export const StyledDeleteButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  color: ${({ theme }) => theme.colors.orange};
  border-color: ${({ theme }) => theme.colors.orange};
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

export const StyledEmpty = styled.div`
  padding: 4rem 0;
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.3;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`

export const StyledLocaleTabs = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.375rem;
`

export const StyledLocaleTab = styled(Button).attrs({ variant: 'label' })`
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
