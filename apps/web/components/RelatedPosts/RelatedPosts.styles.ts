import styled from 'styled-components'

export const StyledSection = styled.section`
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledHeading = styled.h2`
  font-family: var(--font-roboto-mono);
  font-weight: 400;
  font-size: 1.25rem;
  color: #fbfbfb;
  margin: 0 0 1.5rem;
`

export const StyledList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (width >= 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width >= 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`
