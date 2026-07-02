import styled from 'styled-components'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  /* The preview column is a flex row that stretches its children; opt out so the
     croquis keeps its natural (aspect-ratio) height instead of being squashed. */
  align-self: flex-start;
`

export const StyledActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledUploadedLink = styled.a`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.green};
`
