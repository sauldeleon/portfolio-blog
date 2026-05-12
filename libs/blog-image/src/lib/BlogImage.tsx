import { CldImage } from 'next-cloudinary'

import { StyledCaption, StyledFigure } from './BlogImage.styles'

export type BlogImagePosition = 'full' | 'center' | 'left' | 'right'

export interface BlogImageProps {
  src: string
  alt: string
  position?: BlogImagePosition
  caption?: string
  width?: number
  height?: number
}

export function BlogImage({
  src,
  alt,
  position = 'center',
  caption,
  width = 800,
  height = 600,
}: BlogImageProps) {
  return (
    <StyledFigure $position={position}>
      <CldImage src={src} alt={alt} width={width} height={height} />
      {caption && <StyledCaption>{caption}</StyledCaption>}
    </StyledFigure>
  )
}
