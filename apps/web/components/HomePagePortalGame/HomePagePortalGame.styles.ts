import styled, { css } from 'styled-components'

export const PortalContainer = styled.div`
  --transform-origin-first: bottom;
  --transform-origin-last: top;
  --rotate3D-first: 1, 0, 0, -45deg;
  --rotate3D-last: 1, 0, 0, 45deg;
  --height-middle: 30%;
  --width-middle: unset;

  position: relative;
  display: flex;
  flex-direction: column;
  aspect-ratio: 1/1.7;
  align-items: stretch;
  gap: 15px;
  width: 100%;
  max-width: 300px;

  ${({ theme }) => theme.media.up.md} {
    --transform-origin-first: right;
    --transform-origin-last: left;
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
`

export const FirstWall = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    border: 1px solid ${theme.colors.yellow};
    transform-origin: var(--transform-origin-first);
    transform: perspective(600px) rotate3D(var(--rotate3D-first));
    background-color: ${theme.colors.black};
  `}
`

export const MiddleWall = styled.div`
  ${({ theme }) => css`
    position: relative;
    border: 1px solid;
    border-image-slice: 1;
    border-width: 1px;
    border-image-source: linear-gradient(
      to right,
      ${theme.colors.yellow},
      ${theme.colors.green}
    );
    height: var(--height-middle);
    width: var(--width-middle);
    background-color: ${theme.colors.black};
  `}
`

export const LastWall = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    border: 1px solid ${theme.colors.green};
    transform-origin: var(--transform-origin-last);
    transform: perspective(600px) rotate3D(var(--rotate3D-last));
    background-color: ${theme.colors.black};
  `}
`
