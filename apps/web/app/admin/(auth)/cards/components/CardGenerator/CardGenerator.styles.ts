import styled from 'styled-components'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
  width: 100%;
  max-width: 2200px;
  margin: 0 auto;
`

export const StyledTitle = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledCardTypeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(560px, 900px) 1fr;
  gap: 2.5rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

export const StyledPanelForm = styled.div`
  min-width: 0;
`

export const StyledPanelPreview = styled.div`
  min-width: 0;
  display: flex;
  justify-content: center;
  /* The preview column owns the scrollbar: it sticks to the viewport and scrolls
     its (potentially long) card list internally, so the form on the left stays
     fully visible and reachable. */
  position: sticky;
  top: 1rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;

  > * {
    width: 100%;
    max-width: 1200px;
  }

  @media (max-width: 900px) {
    position: static;
    max-height: none;
    overflow: visible;
  }
`
