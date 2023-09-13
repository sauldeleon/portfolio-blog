import styled, { css } from 'styled-components'

export const PortalContainer = styled.div`
  --transform-origin-first: bottom;
  --transform-origin-last: top;
  --perspective: 100px;
  --rotate3D-first: 1, 0, 0, -45deg;
  --rotate3D-last: 1, 0, 0, 45deg;
  --height-middle: 60%;
  --width-middle: unset;

  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 1/2;
  align-items: stretch;
  gap: 15px;
  width: 100%;
  max-width: 300px;

  ${({ theme }) => theme.media.up.md} {
    --transform-origin-first: right;
    --transform-origin-last: left;
    --perspective: 300px;
    --rotate3D-first: 0, 1, 0, 45deg;
    --rotate3D-last: 0, 1, 0, -45deg;
    --height-middle: unset;
    --width-middle: clamp(0px, 60%, 830px);

    flex-direction: row;
    aspect-ratio: unset;
    height: 395px;
    overflow-x: clip;
    max-width: unset;
  }
  ${({ theme }) => theme.media.up.lg} {
    --perspective: 400px;
  }
  ${({ theme }) => theme.media.up.xl} {
    --perspective: 600px;
  }
`

export const FirstWall = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    z-index: -1;
    border: 1px solid ${theme.colors.yellow};
    border-top: none;
    transform-origin: var(--transform-origin-first);
    transform: perspective(var(--perspective)) rotate3D(var(--rotate3D-first));
    background-color: ${theme.colors.black};

    ${theme.media.up.md} {
      border-top: 1px solid ${theme.colors.yellow};
      border-left: none;
    }
  `}
`

export const MiddleWall = styled.div`
  ${({ theme }) => css`
    position: relative;
    ${({ theme }) => theme.helpers.border.gradientShared}
    ${({ theme }) => theme.helpers.border.gradientBottom}
    height: var(--height-middle);
    width: var(--width-middle);
    background-color: ${theme.colors.black};

    ${theme.media.up.md} {
      ${({ theme }) => theme.helpers.border.gradientRight}
    }
  `}
`

export const LastWall = styled.div`
  ${({ theme }) => css`
    z-index: -1;
    flex-grow: 1;
    border: 1px solid ${theme.colors.green};
    border-bottom: none;
    transform-origin: var(--transform-origin-last);
    transform: perspective(var(--perspective)) rotate3D(var(--rotate3D-last));
    background-color: ${theme.colors.black};

    ${theme.media.up.md} {
      border-bottom: 1px solid ${theme.colors.green};
      border-right: none;
    }
  `}
`
