import styled, { css } from 'styled-components'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

/* Same frame as the interactive card (InteractiveCard's StyledFrame), so the
   static and interactive previews look alike. */
export const StyledPreviewFrame = styled.div<{
  $clickable?: boolean
  $selected?: boolean
}>`
  width: 100%;
  border: 1px solid
    ${({ theme, $selected }) => ($selected ? theme.colors.green : '#223442')};
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #14212c 0%, #0d161d 100%);
  box-shadow: 0 24px 60px -30px #000;

  ${({ $clickable }) =>
    $clickable &&
    css`
      display: block;
      padding: 0;
      color: inherit;
      cursor: pointer;
      text-align: left;

      &:hover {
        border-color: rgba(255, 255, 255, 0.25);
      }
    `}
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
