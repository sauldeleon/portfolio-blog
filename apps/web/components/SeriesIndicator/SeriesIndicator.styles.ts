import styled from 'styled-components'

export const StyledSection = styled.section`
  margin-top: 3rem;
  padding: 1.5rem;
  border: 1px solid rgba(152, 223, 214, 0.2);
  border-radius: 2px;
`

export const StyledHeading = styled.h3`
  font-family: var(--font-roboto-mono);
  font-weight: 400;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.green};
  margin: 0 0 1rem;
`

export const StyledList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const StyledItem = styled.li<{ $current: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.8rem;
  opacity: ${({ $current }) => ($current ? 1 : 0.55)};
`

export const StyledOrder = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.green};
  min-width: 1.25rem;
  font-family: var(--font-roboto-mono);
`

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCurrentLabel = styled.span`
  color: ${({ theme }) => theme.colors.white};
`

export const StyledPartLabel = styled.p`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.green};
  opacity: 0.7;
  margin: 0 0 0.75rem;
`
