import styled, { css, keyframes } from 'styled-components'

export const StyledSlideshow = styled.figure`
  margin: 2rem 0;
  width: 100%;
`

export const StyledSlideshowImageArea = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  border-radius: 2px;

  ${({ theme }) => theme.media.up.sm} {
    height: 360px;
  }

  ${({ theme }) => theme.media.up.md} {
    height: 500px;
  }

  ${({ theme }) => theme.media.up.lg} {
    height: 640px;
  }
`

export const StyledSlideshowImageWrapper = styled.div<{
  $expandable?: boolean
}>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;

  ${({ $expandable }) => $expandable && `cursor: zoom-in;`}
`

const slideInFromRight = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`

const slideInFromLeft = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

export const StyledSlideshowSlide = styled.div<{
  $direction: 'next' | 'prev' | 'none'
}>`
  position: absolute;
  inset: 0;

  ${({ $direction }) => {
    if ($direction === 'next')
      return css`
        animation: ${slideInFromRight} 0.35s ease;
      `
    if ($direction === 'prev')
      return css`
        animation: ${slideInFromLeft} 0.35s ease;
      `
    return ''
  }}
`

export const StyledSlideshowCaptionOverlay = styled.div<{
  $pos: 'top' | 'bottom'
}>`
  position: absolute;
  left: 0;
  right: 0;
  ${({ $pos }) => ($pos === 'top' ? 'top: 0;' : 'bottom: 0;')}
  z-index: 3;
  padding: 0.4rem 0.75rem;
  background: linear-gradient(
    ${({ $pos }) => ($pos === 'top' ? 'to bottom' : 'to top')},
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.55) 100%
  );
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  pointer-events: none;
`

export const StyledSlideshowNav = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.5rem 0 0.25rem;
`

export const StyledSlideshowArrow = styled.button<{ $side: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ $side }) => ($side === 'prev' ? '0.5rem' : 'auto')};
  right: ${({ $side }) => ($side === 'next' ? '0.5rem' : 'auto')};
  z-index: 2;

  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  margin: 0;

  background: rgba(0, 0, 0, 0.4);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.75;

  &:hover:not(:disabled) {
    opacity: 1;
    background: rgba(0, 0, 0, 0.65);
    color: ${({ theme }) => theme.colors.green};
  }

  &:disabled {
    opacity: 0.15;
    cursor: not-allowed;
  }

  ${({ theme }) => theme.media.up.md} {
    width: 2.75rem;
    height: 2.75rem;
  }
`

export const StyledSlideshowCounter = styled.span`
  font-family: var(--font-roboto-mono);
  font-size: 0.75rem;
  color: rgba(251, 251, 251, 0.5);
  min-width: 3rem;
  text-align: center;
`
