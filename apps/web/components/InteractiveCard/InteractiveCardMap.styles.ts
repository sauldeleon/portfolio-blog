import styled, { keyframes } from 'styled-components'

const markerPulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`

export const StyledFrame = styled.div`
  position: relative;
  border: 1px solid #223442;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #14212c 0%, #0d161d 100%);
  box-shadow: 0 24px 60px -30px #000;
  flex-shrink: 0;
`

export const StyledScroll = styled.div<{ $ratio: number }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $ratio }) => $ratio};
`

/* "Tap the highlighted zones" hint shown under the card. The amber dot echoes
   the highlight colour so the invitation reads clearly. */
export const StyledHint = styled.p`
  margin: 0.5rem 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-align: center;
  color: #93a7b2;

  &::before {
    content: '';
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.orange};
  }
`

/* The static card SVG fills the frame; overlay hit-zones sit on top of it. */
export const StyledCard = styled.div`
  position: absolute;
  inset: 0;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`

export const StyledOverlay = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Only the zones capture pointer events; clicks elsewhere pass through. */
  pointer-events: none;
`

export const StyledZone = styled.g`
  pointer-events: auto;
  cursor: pointer;
  outline: none;

  .glow {
    opacity: 0;
    transition: opacity 0.18s;
  }

  &:hover .glow,
  &:focus-visible .glow {
    opacity: 1;
  }

  .ring {
    opacity: 0;
  }

  &:focus-visible .ring {
    opacity: 1;
  }

  /* Persistent marker so readers can spot the interactive zones without
     hovering. It lives in this overlay only — the exported PNG is rendered from
     the separate static card SVG, so the markers never appear in the download.
     Fades out while the zone is active so the highlight can take over. */
  .marker {
    fill: ${({ theme }) => theme.colors.orange};
    animation: ${markerPulse} 1.8s ease-in-out infinite;
    transition: opacity 0.18s;
  }

  &:hover .marker,
  &:focus-visible .marker {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .marker {
      animation: none;
    }
  }
`

export const StyledPopover = styled.div<{ $wide: boolean }>`
  position: fixed;
  width: ${({ $wide }) => ($wide ? '360px' : '300px')};
  max-height: min(70vh, 460px);
  overflow-y: auto;
  background: #101c26;
  border: 1px solid #2f4a5a;
  border-radius: 14px;
  box-shadow: 0 20px 50px -20px #000;
  padding: 0.85rem 0.95rem 0.75rem;
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 0.16s,
    transform 0.16s;
  pointer-events: none;
  /* Portalled to <body>; must sit above the insert modal (1040) and picker (1100). */
  z-index: 1200;

  &[data-open='true'] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const StyledPopoverTitle = styled.p`
  font-family: monospace;
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0 0 0.6rem;
`

export const StyledScaleList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`

export const StyledScaleRow = styled.li<{ $active: boolean }>`
  display: grid;
  grid-template-columns: 2.4rem 1fr;
  gap: 0.55rem;
  padding: 0.4rem 0.45rem;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? '#f4b83c' : 'transparent')};
  background: ${({ $active }) =>
    $active ? 'rgba(244,184,60,0.1)' : 'transparent'};
`

export const StyledScaleGrade = styled.span`
  font-family: monospace;
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
`

export const StyledScaleBody = styled.div`
  min-width: 0;
`

export const StyledScaleName = styled.span`
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0.1rem;
`

export const StyledScaleDesc = styled.span`
  display: block;
  font-size: 0.74rem;
  line-height: 1.4;
  color: #93a7b2;
`

export const StyledAffects = styled.p`
  margin: 0.7rem 0 0;
  font-size: 0.76rem;
  line-height: 1.45;
  color: #93a7b2;

  strong {
    color: ${({ theme }) => theme.colors.white};
    font-weight: 600;
  }
`

export const StyledPhenomenon = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  .label {
    font-size: 0.95rem;
    font-weight: 650;
    color: ${({ theme }) => theme.colors.white};
  }

  .desc {
    font-size: 0.8rem;
    line-height: 1.5;
    color: #93a7b2;
  }
`

export const StyledSource = styled.p`
  margin: 0.7rem 0 0;
  font-family: monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f7481;
`
