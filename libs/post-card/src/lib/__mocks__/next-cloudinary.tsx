import React from 'react'

export function CldImage({
  src,
  alt,
  width,
  height,
}: {
  src: string
  alt: string
  width: number
  height: number
}) {
  return <img src={src} alt={alt} width={width} height={height} />
}
