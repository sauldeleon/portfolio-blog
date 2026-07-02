import styled from 'styled-components'

export const StyledFrame = styled.div`
  position: relative;
  border: 1px solid #223442;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(180deg, #14212c 0%, #0d161d 100%);
  box-shadow: 0 24px 60px -30px #000;
  /* Never let the frame shrink below its aspect-ratio height in a flex column. */
  flex-shrink: 0;
`

export const StyledScroll = styled.div<{ $ratio: number }>`
  width: 100%;
  /* aspect-ratio gives a definite height (svg height:auto is unreliable) so a
     tall serpentine croquis keeps its full height and never clips. */
  aspect-ratio: ${({ $ratio }) => $ratio};

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`

export const StyledObstacle = styled.g`
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
`

export const StyledPopover = styled.div<{ $hasPhoto: boolean }>`
  position: fixed;
  width: ${({ $hasPhoto }) => ($hasPhoto ? '320px' : '260px')};
  background: #101c26;
  border: 1px solid #2f4a5a;
  border-radius: 14px;
  box-shadow: 0 20px 50px -20px #000;
  overflow: hidden;
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
    /* Interactive while open so hovering it keeps it from closing. */
    pointer-events: auto;
  }

  .media {
    height: ${({ $hasPhoto }) => ($hasPhoto ? '200px' : '128px')};
    background: #0a1218;
    border-bottom: 1px solid #223442;
  }

  .media svg,
  .media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .body {
    padding: 0.75rem 0.85rem 0.9rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const StyledKind = styled.p`
  font-family: monospace;
  font-size: 0.64rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0 0 0.15rem;
`

export const StyledName = styled.p`
  font-size: 1rem;
  font-weight: 650;
  color: ${({ theme }) => theme.colors.white};
  margin: 0 0 0.5rem;
`

export const StyledChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.55rem;
`

export const StyledChip = styled.span`
  font-family: monospace;
  font-size: 0.72rem;
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  border: 1px solid #2f4a5a;
  color: ${({ theme }) => theme.colors.white};
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`

export const StyledNotes = styled.ul`
  margin: 0;
  padding-left: 1.1rem;
  color: #93a7b2;
  font-size: 0.8rem;
  line-height: 1.45;
  list-style: disc;

  li {
    margin: 0.1rem 0;
  }
`
