export const CldImage = ({
  alt,
  ...props
}: {
  alt: string
  src: string
  width: number
  height: number
}) => <img alt={alt} {...props} />
