export const CldImage = ({
  alt,
  src,
  onLoad,
  style,
}: {
  alt: string
  src: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  style?: React.CSSProperties
  onLoad?: () => void
}) => <img alt={alt} src={src} style={style} onLoad={onLoad} />

export function getCldImageUrl({ src, width }: { src: string; width: number }) {
  return `https://res.cloudinary.com/test/image/upload/w_${width}/${src}`
}
