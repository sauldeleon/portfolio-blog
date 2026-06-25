import styled from 'styled-components'

export const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledSectionTitle = styled.h3`
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0;
`

export const StyledFieldRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  & > * {
    flex: 1;
    min-width: 120px;
  }
`
