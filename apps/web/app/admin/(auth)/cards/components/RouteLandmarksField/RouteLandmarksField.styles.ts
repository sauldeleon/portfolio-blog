import styled from 'styled-components'

export const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const StyledRow = styled.li`
  display: grid;
  grid-template-columns: 6rem 4.5rem 1fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.75rem;
`

export const StyledKind = styled.span<{ $kind: 'peak' | 'col' }>`
  color: ${({ $kind, theme }) =>
    $kind === 'peak' ? theme.colors.green : theme.colors.white};
  opacity: ${({ $kind }) => ($kind === 'peak' ? 1 : 0.7)};
  white-space: nowrap;
`

export const StyledAltitude = styled.span`
  font-family: 'Roboto Mono', monospace;
  opacity: 0.8;
`

export const StyledEmpty = styled.p`
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.55;
`
