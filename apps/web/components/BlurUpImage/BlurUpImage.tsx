'use client'

import Image from 'next/image'
import { type CSSProperties } from 'react'

import { BlurUp, blurPlaceholderUrl } from '@sdlgr/blur-up'

export interface BlurUpImageProps {
  src: string
  alt: string
  sizes: string
  /** Fill the (positioned) parent instead of sizing to the image. */
  fill?: boolean
  /** Known dimensions; without them the image sizes to its own proportions. */
  width?: number
  height?: number
  objectFit?: CSSProperties['objectFit']
  /** Applied to the full image once it is laid out normally. */
  style?: CSSProperties
  'data-testid'?: string
}

/** `next/image` with a blurred placeholder while a Cloudinary image loads. */
export function BlurUpImage({
  src,
  alt,
  sizes,
  fill = false,
  width = 0,
  height = 0,
  objectFit,
  style,
  'data-testid': testId,
}: BlurUpImageProps) {
  return (
    <BlurUp
      placeholder={blurPlaceholderUrl(src)}
      fill={fill}
      objectFit={objectFit}
      imageStyle={style}
    >
      {(image) =>
        fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            data-testid={testId}
            {...image}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            data-testid={testId}
            {...image}
          />
        )
      }
    </BlurUp>
  )
}
