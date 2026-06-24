import styled from 'styled-components'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledPreviewFrame = styled.div`
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0e1820;
`

export const StyledSvgWrap = styled.div<{ $aspectRatio: number }>`
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`

export const StyledActionBar = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

export const StyledError = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
`

export const StyledUploadedLink = styled.a`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.green};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
