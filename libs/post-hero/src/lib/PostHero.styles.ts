import styled from 'styled-components'

export const StyledHeader = styled.header`
  color: ${({ theme }) => theme.colors.white};
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.blue};
`

export const StyledCategory = styled.span`
  color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
`

export const StyledMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
`
