import styled from 'styled-components'

export const StyledChipList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
`

export const StyledChip = styled.button<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 9999px;
  cursor: pointer;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.white : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.black : theme.colors.white};
  font-size: 0.875rem;

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.colors.white : 'rgba(255, 255, 255, 0.1)'};
  }
`
