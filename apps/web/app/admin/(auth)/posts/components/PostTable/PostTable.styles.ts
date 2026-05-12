import styled, { css } from 'styled-components'

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

export const StyledFilterTabs = styled.div`
  display: flex;
  gap: 0.25rem;
`

export const StyledFilterTab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
  border-color: ${({ $active, theme }) =>
    $active ? theme.colors.green : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  transition:
    opacity 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCount = styled.span`
  opacity: 0.5;
  margin-left: 0.25rem;
`

export const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  padding: 0.375rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.75rem;
  outline: none;
  width: 220px;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
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
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: rgba(152, 223, 214, 0.04);
  }

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

export const StyledTitle = styled.span`
  font-size: 0.8rem;
  opacity: 0.9;
`

export const StyledEmDash = styled.span`
  opacity: 0.25;
`

const badgeBase = css`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: inherit;
`

export const StyledStatusBadge = styled.span<{
  $status: 'published' | 'draft' | 'archived' | string
}>`
  ${badgeBase}
  color: ${({ $status, theme }) =>
    $status === 'published'
      ? theme.colors.black
      : $status === 'draft'
        ? theme.colors.black
        : theme.colors.white};
  background: ${({ $status, theme }) =>
    $status === 'published'
      ? theme.colors.green
      : $status === 'draft'
        ? theme.colors.yellow
        : 'rgba(251,251,251,0.1)'};
  opacity: ${({ $status }) => ($status === 'archived' ? 0.5 : 1)};
`

export const StyledLangChips = styled.div`
  display: flex;
  gap: 0.25rem;
`

export const StyledLangChip = styled.span<{ $present: boolean }>`
  ${badgeBase}
  border: 1px solid
    ${({ $present, theme }) =>
    $present ? theme.colors.green : 'rgba(251,251,251,0.15)'};
  color: ${({ $present, theme }) =>
    $present ? theme.colors.green : theme.colors.white};
  opacity: ${({ $present }) => ($present ? 1 : 0.35)};
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`

const actionButtonBase = css`
  background: transparent;
  border: 1px solid transparent;
  padding: 0.25rem 0.625rem;
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`

export const StyledPublishButton = styled.button<{ $published: boolean }>`
  ${actionButtonBase}
  color: ${({ $published, theme }) =>
    $published ? theme.colors.white : theme.colors.green};
  border-color: ${({ $published, theme }) =>
    $published ? 'rgba(251,251,251,0.2)' : theme.colors.green};

  &:hover:not(:disabled) {
    border-color: ${({ $published, theme }) =>
      $published ? theme.colors.white : theme.colors.green};
    opacity: 0.8;
  }
`

export const StyledDeleteButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.orange};
  border-color: transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.orange};
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
