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
  position: sticky;
  top: 1rem;
  /* Lift the sticky panel's stacking context above the page footer so the
     select dropdowns are not painted underneath it. */
  z-index: 1;
`

export const StyledPanelPreview = styled.div`
  min-width: 0;
  display: flex;
  justify-content: center;

  > * {
    width: 100%;
    max-width: 1200px;
  }
`
