import styled from 'styled-components'

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

export const StyledHeading = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`
