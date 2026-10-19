import styled from 'styled-components'

export const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const StyledRow = styled.li<{ $hidden: boolean }>`
  display: grid;
  grid-template-columns: auto 12rem 6.5rem 1fr auto;
  opacity: ${({ $hidden }) => ($hidden ? 0.4 : 1)};
  align-items: center;
  gap: 0.6rem;
  font-size: 0.75rem;
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

export const StyledModes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
`

export const StyledTypeOption = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1;

  > svg {
    display: block;
    flex: none;
  }
`
