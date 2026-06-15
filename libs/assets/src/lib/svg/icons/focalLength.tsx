import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const FocalLengthIcon = (
  { title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 1.5a8.5 8.5 0 110 17 8.5 8.5 0 010-17zm0 3A5.5 5.5 0 1012 17 5.5 5.5 0 0012 6.5zm0 1.5a4 4 0 110 8 4 4 0 010-8zm0 2.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
      fill="currentColor"
    />
  </svg>
)
const ForwardRef = forwardRef(FocalLengthIcon)
export { ForwardRef as ReactComponent }
