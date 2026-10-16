import { type CSSProperties, type ReactNode } from 'react'

import { StyledBlurPlaceholder, StyledBlurUp } from './BlurUp.styles'

export interface BlurUpImageProps {
  'data-blur-up': ''
  /** `data-loaded` is added by BlurUpScript, outside React. */
  suppressHydrationWarning: true
  style: CSSProperties
}

export interface BlurUpProps {
  /** Tiny blurred copy of the image. Without one the image renders as is. */
  placeholder?: string
  /** Fill the (positioned) parent instead of sizing to the image. */
  fill?: boolean
  objectFit?: CSSProperties['objectFit']
  /** Style of the image (without `fill`). */
  imageStyle?: CSSProperties
  /** Renders the real image, spreading the given props onto its `<img>`. */
  children: (image: BlurUpImageProps) => ReactNode
}

/**
 * Shows a tiny blurred copy of an image while the real one loads, then fades
 * the real one in instead of letting it paint in strips as it downloads.
 * Without `fill`, the blurred copy also reserves the image's space, since it
 * has the same proportions.
 *
 * Whether the image has loaded is tracked by BlurUpScript (in the page's
 * <head>) and CSS rather than React state, so it works from the first byte of
 * HTML instead of waiting for hydration. The fade does not hold back LCP: an
 * image only counts once fully loaded.
 */
export function BlurUp({
  placeholder,
  fill = false,
  objectFit,
  imageStyle,
  children,
}: BlurUpProps) {
  const image: BlurUpImageProps = {
    'data-blur-up': '',
    suppressHydrationWarning: true,
    // When filling, cover the box whatever renders the image (next/image's
    // `fill` does this itself; a plain <img> does not).
    style: fill
      ? {
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit,
        }
      : { ...imageStyle },
  }
  if (!placeholder) return children(image)

  return (
    <StyledBlurUp
      $fill={fill}
      style={fill ? undefined : imageStyle}
      data-testid="blur-up"
    >
      <StyledBlurPlaceholder
        src={placeholder}
        alt=""
        aria-hidden
        $fill={fill}
        $contain={objectFit === 'contain'}
        // Same size limits as the image, so both fill the same box.
        style={{
          objectFit,
          maxWidth: imageStyle?.maxWidth,
          maxHeight: imageStyle?.maxHeight,
        }}
        data-testid="blur-placeholder"
      />
      {children(image)}
    </StyledBlurUp>
  )
}
