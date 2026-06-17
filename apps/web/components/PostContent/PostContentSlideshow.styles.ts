import styled, { css, keyframes } from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledSlideshow = styled.figure`
  margin: 2rem 0;
  width: 100%;
  position: relative;
`

export const StyledSlideshowImageWrapper = styled.div<{
  $expandable?: boolean
}>`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
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

export const StyledSlideshowNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 0 0.25rem;
`

export const StyledSlideshowArrow = styled(Button).attrs({ variant: 'text' })`
  font-size: 1.1rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.6;

  &:hover:not(:disabled) {
    opacity: 1;
    color: ${({ theme }) => theme.colors.green};
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  &::after {
    display: none;
  }
`

export const StyledSlideshowCounter = styled.span`
  font-family: var(--font-roboto-mono);
  font-size: 0.75rem;
  color: rgba(251, 251, 251, 0.5);
  min-width: 3rem;
  text-align: center;
`
