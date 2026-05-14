import styled from 'styled-components'

export const StyledPageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
`

export const StyledCard = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border: 1px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(
    to bottom,
    ${({ theme }) => theme.colors.yellow},
    ${({ theme }) => theme.colors.green}
  );
  background: rgba(251, 251, 251, 0.02);
`

export const StyledCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 2rem;
`

export const StyledTitle = styled.h1`
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledSubtitle = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  margin: 0;
  letter-spacing: 0.04em;
`
