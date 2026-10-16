import styled, { css } from 'styled-components'

/*
 * The real image is the wrapper's `img[data-blur-up]`. Rules use :where() for
 * zero specificity, so the consumer's own image styles always win.
 */
export const StyledBlurUp = styled.span<{ $fill: boolean }>`
  position: ${({ $fill }) => ($fill ? 'absolute' : 'relative')};
  display: block;
  overflow: hidden;
  ${({ $fill }) => ($fill ? 'inset: 0;' : 'width: 100%;')}

  :where(& > img[data-blur-up]) {
    position: relative;
    z-index: 1;
    transition: opacity 0.6s ease-out;
  }

  /* Hidden until BlurUpScript flags it loaded. */
  :where(& > img[data-blur-up]:not([data-loaded])) {
    opacity: 0;
  }

  ${({ $fill }) =>
    !$fill &&
    css`
      /* Until it loads it covers the box the blurred copy sizes. */
      :where(& > img[data-blur-up]:not([data-loaded])) {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* Then it takes its own place and the blurred copy goes behind it. */
      &:has(> img[data-loaded]) > img[aria-hidden] {
        position: absolute;
        inset: 0;
        height: 100%;
      }
    `}
`

/*
 * Without `fill` it sits in the flow and gives the box the image's
 * proportions until the image loads; when filling it covers the box. When it
 * covers the box it is scaled up slightly so the CSS blur does not reveal soft
 * edges; when contained that would spill it beyond the picture.
 */
export const StyledBlurPlaceholder = styled.img<{
  $fill: boolean
  $contain: boolean
}>`
  display: block;
  width: 100%;
  height: ${({ $fill }) => ($fill ? '100%' : 'auto')};
  filter: blur(12px);
  transform: ${({ $contain }) => ($contain ? 'none' : 'scale(1.1)')};
  ${({ $fill }) => $fill && 'position: absolute; inset: 0;'}
`
