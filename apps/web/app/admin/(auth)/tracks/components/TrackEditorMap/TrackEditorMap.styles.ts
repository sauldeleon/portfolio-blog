import styled, { css } from 'styled-components'

export const StyledMapWrapper = styled.div<{ $crosshair: boolean }>`
  position: relative;
  height: 60vh;
  min-height: 320px;

  /* In the full-height editor the map takes whatever the profile leaves. */
  ${({ theme }) => theme.media.up.lg} {
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
  }

  border-radius: 2px;
  overflow: hidden;

  .leaflet-container {
    width: 100%;
    height: 100%;
    background: #111;
  }

  ${({ $crosshair }) =>
    $crosshair &&
    css`
      .leaflet-container,
      .leaflet-interactive {
        cursor: crosshair;
      }
    `}

  .track-vertex-handle {
    background: #ffdd83;
    border: 2px solid #000;
    border-radius: 50%;
    box-sizing: border-box;
    cursor: move;
  }
`

export const StyledHint = styled.p`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin: 0;
  padding: 0.4rem 0.8rem;
  background: rgba(0, 0, 0, 0.8);
  color: #fbfbfb;
  font-size: 0.7rem;
  pointer-events: none;
`
