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
  border: 1px solid currentColor;
  border-radius: 9999px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'currentColor' : 'transparent')};
  font-size: 0.875rem;
`
