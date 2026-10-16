import React from 'react'

export function CldImage({
  src,
  alt,
  width,
  height,
  onLoad,
  style,
}: {
  src: string
  alt: string
  width: number
  height: number
  onLoad?: () => void
  style?: React.CSSProperties
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      onLoad={onLoad}
      style={style}
    />
  )
}

export function getCldImageUrl({ src, width }: { src: string; width: number }) {
  return `https://res.cloudinary.com/test/image/upload/w_${width}/${src}`
}
