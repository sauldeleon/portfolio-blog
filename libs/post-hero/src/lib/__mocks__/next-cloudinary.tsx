export const CldImage = ({
  alt,
  src,
}: {
  alt: string
  src: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  style?: React.CSSProperties
}) => <img alt={alt} src={src} />
