import styled from 'styled-components'

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

export const StyledNewButton = styled.button`
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.white};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: transparent;
    color: ${({ theme }) => theme.colors.white};
  }
`

export const StyledCreateForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  flex-wrap: wrap;
`

export const StyledCreateInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  padding: 0.375rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.75rem;
  outline: none;
  min-width: 160px;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCreateError = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.orange};
  flex-basis: 100%;
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

export const StyledEditInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.green};
  padding: 0.25rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.8rem;
  outline: none;
  width: 100%;
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`

const actionButtonBase = `
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
    color 0.15s;
`

export const StyledEditButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;

  &:hover {
    border-color: ${({ theme }) => theme.colors.white};
    opacity: 1;
  }
`

export const StyledSaveButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};

  &:hover {
    opacity: 0.8;
  }
`

export const StyledCancelButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
`

export const StyledDeleteButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.orange};

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
