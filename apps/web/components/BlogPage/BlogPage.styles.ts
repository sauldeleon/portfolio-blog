import styled from 'styled-components'

export const StyledPage = styled.main`
  width: 100%;
  padding: 2rem 1rem 4rem;

  @media (width >= 1024px) {
    padding: 3rem 2rem 5rem;
  }
`

export const StyledHeader = styled.header`
  margin-bottom: 2.5rem;
`

export const StyledHeading = styled.h1`
  font-family: var(--font-roboto-mono);
  font-weight: 400;
  color: #fbfbfb;
  font-size: 2rem;
  line-height: normal;
  margin: 0 0 0.75rem;

  @media (width >= 1024px) {
    font-size: 3rem;
  }
`

export const StyledHeadingAccent = styled.div`
  height: 2px;
  width: 3rem;
  background: linear-gradient(to right, #ffdd83, #98dfd6);
`

export const StyledFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
`

export const StyledGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;

  @media (width >= 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width >= 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
`

export const StyledEmpty = styled.p`
  font-family: var(--font-roboto-mono);
  color: #fbfbfb;
  opacity: 0.5;
  text-align: center;
  padding: 4rem 0;
  margin: 0;
`

export const StyledPaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
`
